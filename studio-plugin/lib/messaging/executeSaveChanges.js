import upath from "upath";
export default function executeSaveChanges(saveData, fileManager, orchestrator) {
    const { pageNameToPageState, pendingChanges, UUIDToFileMetadata, siteSettings, } = saveData;
    fileManager.syncFileMetadata(UUIDToFileMetadata);
    pendingChanges.pagesToRemove.forEach((pageToRemove) => {
        const filepath = upath.join(fileManager.getUserPaths().pages, pageToRemove) + ".tsx";
        fileManager.removeFile(filepath);
        orchestrator.reloadFile(filepath);
    });
    pendingChanges.pagesToUpdate.forEach((pageToUpdate) => {
        const filepath = pageNameToPageState[pageToUpdate]?.filepath;
        fileManager.updatePageFile(filepath, pageNameToPageState[pageToUpdate]);
        orchestrator.reloadFile(filepath);
    });
    if (siteSettings?.values) {
        fileManager.updateSiteSettings(siteSettings.values);
    }
}
//# sourceMappingURL=executeSaveChanges.js.map