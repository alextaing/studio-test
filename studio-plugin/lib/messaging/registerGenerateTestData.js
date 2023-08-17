import { spawnSync } from "child_process";
import { registerListener } from "./registerListener";
import { MessageID, ResponseType, } from "../types";
/**
 * Registers a listener for generating test data.
 */
export default function registerGenerateTestData(server, localDataMappingManager) {
    registerListener(server, MessageID.GenerateTestData, ({ featuresJson }) => {
        const response = generateTestData(featuresJson);
        localDataMappingManager.refreshMapping();
        return {
            ...response,
            mappingJson: localDataMappingManager.getMapping(),
        };
    });
}
/**
 * Spawns a `yext pages generate-test-data -a` call with the given FeaturesJson.
 */
function generateTestData(featuresJson) {
    const prepareJsonForCmd = (json) => {
        if (process.platform === "win32") {
            return `${JSON.stringify(json).replace(/([\\]*)"/g, `$1$1\\"`)}`;
        }
        else {
            return `'${JSON.stringify(json)}'`;
        }
    };
    const stringifiedFeaturesJson = prepareJsonForCmd(featuresJson);
    const output = spawnSync("yext", [
        "pages",
        "generate-test-data",
        "-a",
        "--featuresConfig",
        stringifiedFeaturesJson,
    ], {
        stdio: "inherit",
        shell: true,
        windowsVerbatimArguments: true,
    });
    if (output.status !== 0) {
        return {
            type: ResponseType.Error,
            msg: "Could not generate test data.",
        };
    }
    return {
        type: ResponseType.Success,
        msg: "Successfully generated test data.",
    };
}
//# sourceMappingURL=registerGenerateTestData.js.map