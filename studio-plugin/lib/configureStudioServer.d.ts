import { ViteDevServer } from "vite";
import FileSystemManager from "./FileSystemManager";
import GitWrapper from "./git/GitWrapper";
import ParsingOrchestrator from "./ParsingOrchestrator";
import LocalDataMappingManager from "./LocalDataMappingManager";
import { UserPaths } from "./types";
/**
 * A factory method for our vite plugin's configureServer handler.
 */
export default function createConfigureStudioServer(fileSystemManager: FileSystemManager, gitWrapper: GitWrapper, orchestrator: ParsingOrchestrator, localDataMappingManager: LocalDataMappingManager | undefined, pathToUserProjectRoot: string, userPaths: UserPaths): (server: ViteDevServer) => void;
//# sourceMappingURL=configureStudioServer.d.ts.map