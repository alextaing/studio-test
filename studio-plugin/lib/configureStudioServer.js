import registerDeployListener from "./messaging/registerDeployListener";
import registerSaveChangesListener from "./messaging/registerSaveChangesListener";
import registerGenerateTestData from "./messaging/registerGenerateTestData";
import HmrManager from "./HmrManager";
/**
 * A factory method for our vite plugin's configureServer handler.
 */
export default function createConfigureStudioServer(fileSystemManager, gitWrapper, orchestrator, localDataMappingManager, pathToUserProjectRoot, userPaths) {
    /**
     * Sets up websocket listeners.
     */
    return function configureStudioServer(server) {
        const hmrManager = new HmrManager(server, orchestrator, userPaths);
        hmrManager.createWatcher(pathToUserProjectRoot);
        registerSaveChangesListener(server, fileSystemManager, gitWrapper, orchestrator);
        registerDeployListener(server, fileSystemManager, gitWrapper, orchestrator);
        localDataMappingManager &&
            registerGenerateTestData(server, localDataMappingManager);
    };
}
//# sourceMappingURL=configureStudioServer.js.map