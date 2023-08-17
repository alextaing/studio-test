import { SyntaxKind, } from "ts-morph";
import StaticParsingHelpers from "./helpers/StaticParsingHelpers";
import { GET_PATH_FUNCTION_NAME } from "../constants";
import TsMorphHelpers from "./helpers/TsMorphHelpers";
const STRING_KINDS = [
    SyntaxKind.StringLiteral,
    SyntaxKind.PropertyAccessExpression,
    SyntaxKind.TemplateExpression,
    SyntaxKind.ElementAccessExpression,
    SyntaxKind.NoSubstitutionTemplateLiteral,
];
/**
 * GetPathParser is a class for parsing the getPath function in a PageFile.
 */
export default class GetPathParser {
    studioSourceFileParser;
    constructor(studioSourceFileParser) {
        this.studioSourceFileParser = studioSourceFileParser;
    }
    /**
     * Gets the return value of the getPath function if one is defined, and if
     * there is a single, top-level, string literal or expression returned from
     * it.
     */
    parseGetPathValue() {
        const stringNode = this.getReturnStringNode();
        if (!stringNode) {
            return;
        }
        const parsedProp = StaticParsingHelpers.parseInitializer(stringNode);
        if (parsedProp === undefined) {
            return;
        }
        const { kind, value } = parsedProp;
        if (typeof value === "string") {
            return { kind, value };
        }
    }
    /**
     * If a getPath function is defined and a single, top-level, string literal
     * or expression is returned from it, returns it. If a getPath function is
     * not defined, an error is thrown.
     */
    getReturnStringNode() {
        const getPathFunction = this.findGetPathFunction();
        if (!getPathFunction) {
            throw new Error("Error parsing getPath value: no getPath function found.");
        }
        if (getPathFunction.isKind(SyntaxKind.FunctionDeclaration)) {
            const block = getPathFunction.getFirstChildByKind(SyntaxKind.Block);
            return block && this.handleBlock(block);
        }
        const body = getPathFunction.getLastChild();
        if (!body) {
            return;
        }
        if (body.isKind(SyntaxKind.Block)) {
            return this.handleBlock(body);
        }
        return this.getStringNode(body);
    }
    /**
     * Returns the getPath function if one is defined.
     */
    findGetPathFunction() {
        return this.studioSourceFileParser.getFunctionNode(GET_PATH_FUNCTION_NAME);
    }
    handleBlock(block) {
        const returnStatements = block.getChildrenOfKind(SyntaxKind.ReturnStatement);
        if (returnStatements.length > 0) {
            const returnStatement = returnStatements[0];
            const returnValue = returnStatement.getChildAtIndex(1);
            return this.getStringNode(returnValue);
        }
    }
    getStringNode(node) {
        if (TsMorphHelpers.isKind(node, ...STRING_KINDS)) {
            return node;
        }
        if (node.isKind(SyntaxKind.ParenthesizedExpression)) {
            const unwrappedExp = StaticParsingHelpers.unwrapParensExpression(node);
            const child = TsMorphHelpers.getFirstChildOfKind(unwrappedExp, ...STRING_KINDS);
            return child;
        }
    }
}
//# sourceMappingURL=GetPathParser.js.map