import { PropShape } from "../types/PropShape";
import { PropValues } from "../types/PropValues";
import StudioSourceFileParser from "./StudioSourceFileParser";
/**
 * PropValuesParser is a class for parsing object literals in a Studio file into PropValues.
 */
export default class PropValuesParser {
    private studioSourceFileParser;
    constructor(studioSourceFileParser: StudioSourceFileParser);
    /**
     * Parses the given exported variable into PropValues.
     * If no variableName is provided, the default export will be parsed
     *
     * @param propShape - Shape of the component's props
     * @param variableName - the variable to parse into PropValues.
     */
    parsePropValues(propShape: PropShape, variableName?: string): PropValues | undefined;
    private getRawValues;
    private parseRawValues;
    private parseRawVal;
}
//# sourceMappingURL=PropValuesParser.d.ts.map