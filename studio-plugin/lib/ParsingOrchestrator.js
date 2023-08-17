import upath from "upath";
import { FileMetadataKind, } from "./types";
import fs from "fs";
import ComponentFile from "./sourcefiles/ComponentFile";
import ModuleFile from "./sourcefiles/ModuleFile";
import PageFile from "./sourcefiles/PageFile";
import SiteSettingsFile from "./sourcefiles/SiteSettingsFile";
import { Project } from "ts-morph";
import typescript from "typescript";
import { v4 } from "uuid";
export function createTsMorphProject() {
    return new Project({
        compilerOptions: {
            jsx: typescript.JsxEmit.ReactJSX,
        },
    });
}
/**
 * ParsingOrchestrator aggregates data for passing through the Studio vite plugin.
 */
export default class ParsingOrchestrator {
    project;
    studioConfig;
    getLocalDataMapping;
    filepathToFileMetadata;
    filepathToModuleFile = {};
    pageNameToPageFile = {};
    siteSettingsFile;
    studioData;
    paths;
    /** All paths are assumed to be absolute. */
    constructor(project, studioConfig, getLocalDataMapping) {
        this.project = project;
        this.studioConfig = studioConfig;
        this.getLocalDataMapping = getLocalDataMapping;
        this.paths = studioConfig.paths;
        this.filepathToFileMetadata = this.initFilepathToFileMetadata();
        this.pageNameToPageFile = this.initPageNameToPageFile();
    }
    getPageFile(pageName) {
        const pageFile = this.pageNameToPageFile[pageName];
        if (pageFile) {
            return pageFile;
        }
        return this.createPageFile(pageName);
    }
    createPageFile(pageName) {
        const pageEntityFiles = this.getLocalDataMapping?.()[pageName];
        return new PageFile(upath.join(this.paths.pages, pageName + ".tsx"), this.getFileMetadata, this.project, this.studioConfig.isPagesJSRepo, pageEntityFiles);
    }
    getModuleFile(filepath) {
        const moduleFile = this.filepathToModuleFile[filepath];
        if (moduleFile) {
            return moduleFile;
        }
        const newModuleFile = new ModuleFile(filepath, this.getFileMetadata, this.project);
        this.filepathToModuleFile[filepath] = newModuleFile;
        return newModuleFile;
    }
    getUUIDToFileMetadata() {
        const UUIDToFileMetadata = Object.values(this.filepathToFileMetadata).reduce((prev, curr) => {
            prev[curr.metadataUUID] = curr;
            return prev;
        }, {});
        return UUIDToFileMetadata;
    }
    /**
     * Given a filepath, performs necessary actions for reloading the file,
     * so that getStudioData returns up to date information.
     *
     * Will remove data for a file if it no longer exists in the filesystem.
     */
    reloadFile(filepath) {
        const fileExists = fs.existsSync(filepath);
        if (fileExists) {
            const sourceFile = this.project.getSourceFile(filepath);
            sourceFile?.refreshFromFileSystemSync();
        }
        if (filepath.startsWith(this.paths.modules) ||
            filepath.startsWith(this.paths.components)) {
            if (this.filepathToFileMetadata.hasOwnProperty(filepath)) {
                const originalMetadataUUID = this.filepathToFileMetadata[filepath].metadataUUID;
                delete this.filepathToFileMetadata[filepath];
                if (fileExists) {
                    this.filepathToFileMetadata[filepath] = {
                        ...this.getFileMetadata(filepath),
                        metadataUUID: originalMetadataUUID,
                    };
                }
            }
            else if (fileExists) {
                this.filepathToFileMetadata[filepath] = this.getFileMetadata(filepath);
            }
        }
        else if (filepath.startsWith(this.paths.pages)) {
            const pageName = upath.basename(filepath, ".tsx");
            delete this.pageNameToPageFile[pageName];
            if (fileExists) {
                this.pageNameToPageFile[pageName] = this.getPageFile(pageName);
            }
        }
        this.studioData = this.calculateStudioData();
    }
    getStudioData() {
        if (!this.studioData) {
            this.studioData = this.calculateStudioData();
        }
        return this.studioData;
    }
    calculateStudioData() {
        const siteSettings = this.getSiteSettings();
        const pageRecords = Object.keys(this.pageNameToPageFile).reduce((prev, curr) => {
            const pageStateResult = this.pageNameToPageFile[curr].getPageState();
            if (pageStateResult.isOk) {
                prev.pageNameToPageState[curr] = pageStateResult.value;
            }
            else {
                prev.pageNameToErrorPageState[curr] = {
                    message: pageStateResult.error.message,
                };
            }
            return prev;
        }, {
            pageNameToPageState: {},
            pageNameToErrorPageState: {},
        });
        return {
            ...pageRecords,
            UUIDToFileMetadata: this.getUUIDToFileMetadata(),
            siteSettings,
            studioConfig: this.studioConfig,
        };
    }
    initFilepathToFileMetadata() {
        this.filepathToFileMetadata = {};
        const addDirectoryToMapping = (folderPath) => {
            if (!fs.existsSync(folderPath)) {
                return;
            }
            fs.readdirSync(folderPath, "utf-8").forEach((filename) => {
                const absPath = upath.join(folderPath, filename);
                if (fs.lstatSync(absPath).isDirectory()) {
                    addDirectoryToMapping(absPath);
                }
                else {
                    this.filepathToFileMetadata[absPath] = this.getFileMetadata(absPath);
                }
            });
        };
        addDirectoryToMapping(this.paths.components);
        addDirectoryToMapping(this.paths.modules);
        return this.filepathToFileMetadata;
    }
    getFileMetadata = (absPath) => {
        if (this.filepathToFileMetadata[absPath]) {
            return this.filepathToFileMetadata[absPath];
        }
        const createErrorFileMetadata = (error) => ({
            kind: FileMetadataKind.Error,
            metadataUUID: v4(),
            message: error.message,
            filepath: absPath,
        });
        if (absPath.startsWith(this.paths.components)) {
            const componentFile = new ComponentFile(absPath, this.project);
            const result = componentFile.getComponentMetadata();
            if (result.isErr) {
                return createErrorFileMetadata(result.error);
            }
            return result.value;
        }
        if (absPath.startsWith(this.paths.modules)) {
            const result = this.getModuleFile(absPath).getModuleMetadata();
            if (result.isErr) {
                return createErrorFileMetadata(result.error);
            }
            return result.value;
        }
        const { modules, components } = this.paths;
        throw new Error(`Could not get FileMetadata for ${absPath}, file does not ` +
            `live inside the expected folders for modules: ${modules}, ${components}.`);
    };
    initPageNameToPageFile() {
        if (!fs.existsSync(this.paths.pages)) {
            throw new Error(`The pages directory does not exist, expected directory to be at "${this.paths.pages}".`);
        }
        const files = fs.readdirSync(this.paths.pages, "utf-8");
        return files.reduce((pageMap, filename) => {
            const pageName = upath.basename(filename, ".tsx");
            pageMap[pageName] = this.getPageFile(pageName);
            return pageMap;
        }, {});
    }
    getSiteSettings() {
        if (!fs.existsSync(this.paths.siteSettings)) {
            return;
        }
        if (!this.siteSettingsFile) {
            this.siteSettingsFile = new SiteSettingsFile(this.paths.siteSettings, this.project);
        }
        return this.siteSettingsFile.getSiteSettings();
    }
    /**
     * Updates the user's site settings file.
     * Assumes that this.siteSettingsFile already exists.
     */
    updateSiteSettings(siteSettingsValues) {
        this.siteSettingsFile?.updateSiteSettingValues(siteSettingsValues);
    }
}
//# sourceMappingURL=ParsingOrchestrator.js.map