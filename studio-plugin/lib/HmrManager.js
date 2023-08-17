import { StudioHMRUpdateID } from "./types";
import VirtualModuleID from "./VirtualModuleID";
import chokidar from "chokidar";
import upath from "upath";
/**
 * HmrManager is responsible for handling studio specific HMR updates.
 */
export default class HmrManager {
    server;
    orchestrator;
    userPaths;
    constructor(server, orchestrator, userPaths) {
        this.server = server;
        this.orchestrator = orchestrator;
        this.userPaths = userPaths;
    }
    createWatcher(pathToUserProjectRoot) {
        const watcher = chokidar.watch(upath.join(pathToUserProjectRoot, "src"), {
            ignoreInitial: true,
        });
        watcher.on("change", this.handleHotUpdate);
        watcher.on("unlink", this.handleHotUpdate);
        watcher.on("add", this.handleHotUpdate);
    }
    /**
     * A custom handler for vite hot updates.
     *
     * See import('vite').Plugin.handleHotUpdate
     */
    handleHotUpdate = (unnormalizedFilepath) => {
        const file = upath.normalize(unnormalizedFilepath);
        this.orchestrator.reloadFile(file);
        this.invalidateStudioData();
        const updateType = getHMRUpdateType(file, this.userPaths);
        const data = this.getPayload(updateType, file);
        this.server.ws.send({
            type: "custom",
            event: StudioHMRUpdateID,
            data,
        });
    };
    /**
     * Tells the client it needs to refresh its StudioData.
     */
    invalidateStudioData() {
        const studioModule = this.server.moduleGraph.getModuleById("\0" + VirtualModuleID.StudioData);
        if (studioModule) {
            this.server.moduleGraph.invalidateModule(studioModule);
        }
    }
    getPayload(updateType, file) {
        const studioData = this.orchestrator.getStudioData();
        return {
            updateType,
            studioData,
            file,
        };
    }
}
function getHMRUpdateType(file, userPaths) {
    const updateTypes = [
        "siteSettings",
        "components",
        "modules",
        "pages",
    ];
    return (updateTypes.find((updateType) => {
        return file.startsWith(userPaths[updateType]);
    }) ?? "full");
}
//# sourceMappingURL=HmrManager.js.map