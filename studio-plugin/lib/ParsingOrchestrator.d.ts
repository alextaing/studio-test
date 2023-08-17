import { FileMetadata, StudioData, SiteSettingsValues, StudioConfigWithDefaulting } from "./types";
import ModuleFile from "./sourcefiles/ModuleFile";
import PageFile from "./sourcefiles/PageFile";
import { Project } from "ts-morph";
export declare function createTsMorphProject(): Project;
/**
 * ParsingOrchestrator aggregates data for passing through the Studio vite plugin.
 */
export default class ParsingOrchestrator {
    private project;
    private studioConfig;
    private getLocalDataMapping?;
    private filepathToFileMetadata;
    private filepathToModuleFile;
    private pageNameToPageFile;
    private siteSettingsFile?;
    private studioData?;
    private paths;
    /** All paths are assumed to be absolute. */
    constructor(project: Project, studioConfig: StudioConfigWithDefaulting, getLocalDataMapping?: (() => Record<string, string[]>) | undefined);
    getPageFile(pageName: string): PageFile;
    private createPageFile;
    getModuleFile(filepath: string): ModuleFile;
    getUUIDToFileMetadata(): Record<string, FileMetadata>;
    /**
     * Given a filepath, performs necessary actions for reloading the file,
     * so that getStudioData returns up to date information.
     *
     * Will remove data for a file if it no longer exists in the filesystem.
     */
    reloadFile(filepath: string): void;
    getStudioData(): StudioData;
    private calculateStudioData;
    private initFilepathToFileMetadata;
    private getFileMetadata;
    private initPageNameToPageFile;
    private getSiteSettings;
    /**
     * Updates the user's site settings file.
     * Assumes that this.siteSettingsFile already exists.
     */
    updateSiteSettings(siteSettingsValues: SiteSettingsValues): void;
}
//# sourceMappingURL=ParsingOrchestrator.d.ts.map