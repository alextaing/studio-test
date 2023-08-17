import { SyntaxKind } from "ts-morph";
import { PropValueKind, PropValueType, } from "../types/PropValues";
import StaticParsingHelpers from "../parsers/helpers/StaticParsingHelpers";
import TypeGuards from "../utils/TypeGuards";
/**
 * PropValuesParser is a class for parsing object literals in a Studio file into PropValues.
 */
export default class PropValuesParser {
    studioSourceFileParser;
    constructor(studioSourceFileParser) {
        this.studioSourceFileParser = studioSourceFileParser;
    }
    /**
     * Parses the given exported variable into PropValues.
     * If no variableName is provided, the default export will be parsed
     *
     * @param propShape - Shape of the component's props
     * @param variableName - the variable to parse into PropValues.
     */
    parsePropValues(propShape, variableName) {
        const rawValues = this.getRawValues(variableName);
        if (!rawValues) {
            return undefined;
        }
        return this.parseRawValues(rawValues, propShape);
    }
    getRawValues(variableName) {
        if (variableName) {
            return this.studioSourceFileParser.parseExportedObjectLiteral(variableName);
        }
        const defaultExport = this.studioSourceFileParser.getDefaultExport();
        if (!defaultExport) {
            return undefined;
        }
        if (!defaultExport.isKind(SyntaxKind.ObjectLiteralExpression)) {
            throw new Error(`Expected an ObjectLiteralExpression as the default export in ${this.studioSourceFileParser.getFilepath()}`);
        }
        return StaticParsingHelpers.parseObjectLiteral(defaultExport);
    }
    parseRawValues(rawValues, propShape) {
        const propValues = {};
        Object.keys(rawValues).forEach((propName) => {
            propValues[propName] = this.parseRawVal(propName, rawValues[propName], propShape[propName], propShape);
        });
        return propValues;
    }
    parseRawVal(propName, rawVal, propType, propShape) {
        if (rawVal.kind === PropValueKind.Expression) {
            throw new Error(`Expressions are not supported within object literal.`);
        }
        const typeMatchErrorMessage = `Error parsing value of ${propName} in ${JSON.stringify(propShape, null, 2)}: Expected value ${rawVal} to match PropType ${propType}`;
        const getPropVal = () => {
            const { value } = rawVal;
            if (Array.isArray(value)) {
                if (propType.type !== PropValueType.Array) {
                    throw new Error(typeMatchErrorMessage);
                }
                return {
                    valueType: PropValueType.Array,
                    kind: PropValueKind.Literal,
                    value: value.map((val) => this.parseRawVal(propName, val, propType.itemType, propShape)),
                };
            }
            else if (typeof value === "object") {
                if (propType.type !== PropValueType.Object) {
                    throw new Error(typeMatchErrorMessage);
                }
                return {
                    valueType: PropValueType.Object,
                    kind: PropValueKind.Literal,
                    value: this.parseRawValues(value, propType.shape),
                };
            }
            return {
                valueType: propType.type,
                kind: PropValueKind.Literal,
                value,
            };
        };
        const propVal = getPropVal();
        TypeGuards.assertIsValidPropVal(propVal);
        return propVal;
    }
}
//# sourceMappingURL=PropValuesParser.js.map