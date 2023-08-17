import { MessageID, ResponseType } from "../types";
import { registerListener } from "./registerListener";
import executeSaveChanges from "./executeSaveChanges";
import reloadGitData from "../git/reloadGitData";
export default function registerDeployListener(server, fileManager, gitWrapper, orchestrator) {
    registerListener(server, MessageID.Deploy, async (saveData) => {
        executeSaveChanges(saveData, fileManager, orchestrator);
        await gitWrapper.deploy();
        await reloadGitData(gitWrapper, server);
        return { type: ResponseType.Success, msg: "Deployed successfully." };
    });
}
//# sourceMappingURL=registerDeployListener.js.map