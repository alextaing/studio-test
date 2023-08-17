import ParsingOrchestrator from "./ParsingOrchestrator";
import { UserPaths } from "./types";
import { ViteDevServer } from "vite";
/**
 * HmrManager is responsible for handling studio specific HMR updates.
 */
export default class HmrManager {
    private server;
    private orchestrator;
    private userPaths;
    constructor(server: ViteDevServer, orchestrator: ParsingOrchestrator, userPaths: UserPaths);
    createWatcher(pathToUserProjectRoot: string): void;
    /**
     * A custom handler for vite hot updates.
     *
     * See import('vite').Plugin.handleHotUpdate
     */
    handleHotUpdate: (unnormalizedFilepath: string) => void;
    /**
     * Tells the client it needs to refresh its StudioData.
     */
    private invalidateStudioData;
    private getPayload;
}
//# sourceMappingURL=HmrManager.d.ts.map