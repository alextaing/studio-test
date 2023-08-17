import upath from "upath";
import { FileSystemWriter } from "./writers/FileSystemWriter";
/**
 * Handles file removal and content update in user's repo
 * based on updated state from Studio's client side.
 */
export default class FileSystemManager {
    paths;
    writer;
    constructor(paths, writer) {
        this.paths = paths;
        this.writer = writer;
    }
    removeFile(filepath) {
        this.writer.removeFile(filepath);
    }
    getUserPaths() {
        return this.paths;
    }
    updatePageFile(filepath, pageState) {
        if (!filepath.startsWith(this.paths.pages)) {
            throw new Error(`Cannot update page file: filepath "${filepath}" is not within the` +
                ` expected path for pages "${this.paths.pages}".`);
        }
        FileSystemWriter.openFile(filepath);
        return this.writer.writeToPageFile(upath.basename(filepath, ".tsx"), pageState);
    }
    updateSiteSettings(siteSettingsValues) {
        this.writer.writeToSiteSettings(siteSettingsValues);
    }
    syncFileMetadata(UUIDToFileMetadata) {
        this.writer.syncFileMetadata(UUIDToFileMetadata);
    }
}
//# sourceMappingURL=FileSystemManager.js.map