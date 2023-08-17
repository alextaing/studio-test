import fs from "fs";
import upath from "upath";
import typescript from "typescript";
const { resolveModuleName: resolveTypescriptModule } = typescript;
/**
 * NpmLookup is a class for retrieving information on an import.
 */
export default class NpmLookup {
    importSpecifier;
    initialSearchRoot;
    resolvedFilepath;
    constructor(importSpecifier, initialSearchRoot) {
        this.importSpecifier = importSpecifier;
        this.initialSearchRoot = initialSearchRoot;
        const searchRootDir = upath.dirname(initialSearchRoot);
        this.resolvedFilepath = this.resolveImportSpecifier(searchRootDir);
    }
    resolveImportSpecifier(searchRoot) {
        const customModuleResolutionHost = {
            fileExists(filepath) {
                return fs.existsSync(upath.join(searchRoot, filepath));
            },
            readFile(filepath) {
                return fs.readFileSync(upath.join(searchRoot, filepath), "utf-8");
            },
        };
        const { resolvedModule } = resolveTypescriptModule(this.importSpecifier, "", {}, customModuleResolutionHost);
        if (!resolvedModule) {
            const isLocalFileImport = this.importSpecifier.startsWith(".");
            const parent = upath.join(searchRoot, "..");
            if (isLocalFileImport || searchRoot === parent) {
                throw Error(`The import specifier "${this.importSpecifier}" could not be resolved from ${this.initialSearchRoot}.`);
            }
            return this.resolveImportSpecifier(parent);
        }
        return upath.join(searchRoot, resolvedModule.resolvedFileName);
    }
    getResolvedFilepath() {
        return this.resolvedFilepath;
    }
}
//# sourceMappingURL=NpmLookup.js.map