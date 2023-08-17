import { Project, VariableDeclaration, FunctionDeclaration, ObjectLiteralExpression, Identifier, ArrayLiteralExpression, ArrowFunction } from "ts-morph";
import { ParsedType } from "./helpers/TypeNodeParsingHelper";
import { TypelessPropVal } from "../types";
/**
 * StudioSourceFileParser contains shared business logic for
 * parsing source files used by Studio.
 */
export default class StudioSourceFileParser {
    private filepath;
    private sourceFile;
    constructor(filepath: string, project: Project);
    /**
     * Returns the filepath with posix path separators.
     */
    getFilepath(): string;
    getFilename(): string;
    checkForSyntaxErrors(): void;
    parseNamedImports(): Record<string, string[]>;
    private parseDefaultImports;
    getAbsPathDefaultImports(): Record<string, string>;
    parseCssImports(): string[];
    getExportedObjectExpression(variableName: string): ObjectLiteralExpression | undefined;
    parseExportedObjectLiteral(variableName: string): Record<string, TypelessPropVal> | undefined;
    /**
     * This function takes in an {@link ObjectLiteralExpression} and returns it's data.
     *
     * It converts a js object string and converts it into an object using vm.runInNewContext,
     * which can be thought of as a safe version of `eval`. Note that we cannot use JSON.parse here,
     * because we are working with a js object not a JSON.
     */
    getCompiledObjectLiteral<T>(objectLiteralExp: ObjectLiteralExpression): T;
    private getImportSourceForIdentifier;
    private parseImportedShape;
    /**
     * Parses the type or interface with the given name.
     */
    parseTypeReference: (identifier: string) => ParsedType | undefined;
    /**
     * Returns the default exported node, if one exists.
     *
     * If the exported node uses an AsExpression (type assertion) or is wrapped in a
     * ParenthesizedExpression, those will be unwrapped and the underlying node will be
     * returned instead.
     */
    getDefaultExport(): FunctionDeclaration | Identifier | ObjectLiteralExpression | ArrayLiteralExpression | undefined;
    /**
     * There is full support for default exports defined directly as function
     * declarations. But, for exports defined as assignments, support is restricted
     * as follows:
     * - If there is only a single identifier (e.g. `export default Identifier;`),
     *   it will look for and return the declaration for that identifier.
     * - If an identifier does not have a corresponding variable or function
     *   declaration, it will throw an error.
     * - If the export assignment is an object (e.g.
     *   `export default \{ key: val \};`), an array (e.g.
     *   `export default [Identifier];`), etc., an error will be thrown.
     */
    getDefaultExportReactComponent(): VariableDeclaration | FunctionDeclaration;
    getFunctionNode(funcName: string): FunctionDeclaration | ArrowFunction | undefined;
}
//# sourceMappingURL=StudioSourceFileParser.d.ts.map