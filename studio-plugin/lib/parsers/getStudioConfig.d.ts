import { CliArgs, StudioConfigWithDefaulting } from "../types";
/**
 * Given an absolute path to the user's project root folder, retrieve Studio's
 * configuration defined in "studio.config.js" file, if exist. Any unspecified
 * fields will be given a default value.
 *
 * @param pathToProjectRoot - An absolute path to the project's root folder
 * @throws {@link ParsingError|FileIOError}
 */
export default function getStudioConfig(pathToProjectRoot: string, cliArgs?: CliArgs): Promise<StudioConfigWithDefaulting>;
//# sourceMappingURL=getStudioConfig.d.ts.map