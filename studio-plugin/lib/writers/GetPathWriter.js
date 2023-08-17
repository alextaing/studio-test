import { GET_PATH_FUNCTION_NAME, PAGESJS_TEMPLATE_PROPS_TYPE, } from "../constants";
import { PropValueKind } from "../types/PropValues";
import ExpressionHelpers from "../utils/ExpressionHelpers";
const GET_PATH_FUNCTION_TYPE = "GetPath";
/**
 * GetPathWriter is a class for housing the updating logic for the getPath
 * function in a PageFile.
 */
export default class GetPathWriter {
    studioSourceFileWriter;
    getPathParser;
    pagesJsWriter;
    constructor(studioSourceFileWriter, getPathParser, pagesJsWriter) {
        this.studioSourceFileWriter = studioSourceFileWriter;
        this.getPathParser = getPathParser;
        this.pagesJsWriter = pagesJsWriter;
    }
    /**
     * Updates the getPath function by replacing the returned string's value or
     * adding a new getPath function to the original sourceFile.
     *
     * @param getPathValue - the new value to return from the getPath function
     */
    updateGetPath(getPathValue) {
        const stringNodeText = this.constructStringNodeText(getPathValue);
        const usesDocument = getPathValue.kind === PropValueKind.Expression &&
            ExpressionHelpers.usesExpressionSource(getPathValue.value, "document");
        const getPathFunction = this.getPathParser.findGetPathFunction();
        const stringNode = getPathFunction && this.getPathParser.getReturnStringNode();
        if (stringNode) {
            stringNode.replaceWithText(stringNodeText);
            usesDocument && this.pagesJsWriter.addTemplateParameter(getPathFunction);
        }
        else {
            const functionText = usesDocument
                ? `({ document }) => { return ${stringNodeText}; }`
                : `() => { return ${stringNodeText}; }`;
            this.studioSourceFileWriter.updateVariableStatement(GET_PATH_FUNCTION_NAME, functionText, `${GET_PATH_FUNCTION_TYPE}<${PAGESJS_TEMPLATE_PROPS_TYPE}>`);
        }
        this.pagesJsWriter.addPagesJsImports([
            GET_PATH_FUNCTION_TYPE,
            PAGESJS_TEMPLATE_PROPS_TYPE,
        ]);
    }
    constructStringNodeText({ kind, value }) {
        return kind === PropValueKind.Literal ? `"${value}"` : value;
    }
}
//# sourceMappingURL=GetPathWriter.js.map