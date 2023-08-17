/**
 * NpmLookup is a class for retrieving information on an import.
 */
export default class NpmLookup {
    private importSpecifier;
    private initialSearchRoot;
    private resolvedFilepath;
    constructor(importSpecifier: string, initialSearchRoot: string);
    private resolveImportSpecifier;
    getResolvedFilepath(): string;
}
//# sourceMappingURL=NpmLookup.d.ts.map