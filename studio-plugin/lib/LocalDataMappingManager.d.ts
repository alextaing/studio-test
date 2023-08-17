export default class LocalDataMappingManager {
    private localDataMapping;
    mappingPath: string;
    constructor(localDataPath: string);
    getMapping: () => Record<string, string[]>;
    refreshMapping(): void;
    private readLocalDataMapping;
}
//# sourceMappingURL=LocalDataMappingManager.d.ts.map