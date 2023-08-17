import upath from "upath";
import { existsSync } from "fs";
import fs from "fs";
export default class LocalDataMappingManager {
    localDataMapping;
    mappingPath;
    constructor(localDataPath) {
        this.mappingPath = upath.join(localDataPath, "mapping.json");
        this.localDataMapping = this.readLocalDataMapping();
    }
    getMapping = () => {
        return this.localDataMapping;
    };
    refreshMapping() {
        this.localDataMapping = this.readLocalDataMapping();
    }
    readLocalDataMapping() {
        if (!existsSync(this.mappingPath)) {
            throw new Error(`The localData's mapping.json does not exist, expected the file to be at "${this.mappingPath}".`);
        }
        const jsonString = fs.readFileSync(this.mappingPath, "utf-8");
        return JSON.parse(jsonString);
    }
}
//# sourceMappingURL=LocalDataMappingManager.js.map