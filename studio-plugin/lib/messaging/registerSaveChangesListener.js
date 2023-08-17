import reloadGitData from "../git/reloadGitData";
import { MessageID, ResponseType } from "../types";
import executeSaveChanges from "./executeSaveChanges";
import { registerListener } from "./registerListener";
export default function registerSaveChangesListener(server, fileManager, gitWrapper, orchestrator) {
    registerListener(server, MessageID.SaveChanges, async (saveData) => {
        executeSaveChanges(saveData, fileManager, orchestrator);
        await reloadGitData(gitWrapper, server);
        return { type: ResponseType.Success, msg: "Changes saved successfully." };
    });
}
//# sourceMappingURL=registerSaveChangesListener.js.map