import upath from "upath";
import { fileURLToPath } from "url";
const __dirname = upath.dirname(fileURLToPath(import.meta.url));
export function dynamicImport(absFilepath) {
    const relativeFilepath = getWindowsCompatiblePath(absFilepath);
    return import(relativeFilepath);
}
/**
 * We need to use relative paths and also replace backslashes
 * with forward slashes for windows support.
 */
function getWindowsCompatiblePath(absFilepath) {
    return upath.relative(__dirname, absFilepath);
}
//# sourceMappingURL=dynamicImport.js.map