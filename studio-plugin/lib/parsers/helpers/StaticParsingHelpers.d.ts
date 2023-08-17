import { ArrayLiteralExpression, ExportAssignment, Expression, Identifier, ImportDeclaration, JsxAttributeLike, JsxChild, JsxElement, JsxFragment, JsxSelfClosingElement, ObjectLiteralExpression, ParenthesizedExpression, PropertySignature, PropertyAssignment, JsxExpression, TypeAliasDeclaration } from "ts-morph";
import { PropValues, TypelessPropVal } from "../../types/PropValues";
import { PropShape } from "../../types/PropShape";
export type ParsedImport = {
    source: string;
    defaultImport?: string;
    namedImports: string[];
};
/**
 * StaticParsingHelpers is a static class for housing lower level details for parsing
 * files within Studio.
 */
export default class StaticParsingHelpers {
    private static addTypesToPropVal;
    static parseInitializer: (initializer: Expression) => TypelessPropVal | undefined;
    static parseObjectLiteral(objectLiteral: ObjectLiteralExpression): Record<string, TypelessPropVal>;
    static parseImport(importDeclaration: ImportDeclaration): ParsedImport;
    static getEscapedName(p: PropertySignature | PropertyAssignment | TypeAliasDeclaration): string;
    static parseJsxChild<T>(c: JsxChild, handleJsxChild: (c: JsxFragment | JsxElement | JsxSelfClosingElement | JsxExpression, parent: T | undefined) => T, parent?: T): T[];
    static parseJsxExpression(c: JsxExpression): {
        selfClosingElement: JsxSelfClosingElement;
        listExpression: string;
    };
    static parseJsxAttributes(attributes: JsxAttributeLike[], propShape?: PropShape): PropValues;
    private static assertIsJsxAttribute;
    static parseJsxAttributeName(jsxAttribute: JsxAttributeLike): string;
    static parseJsxAttribute(jsxAttribute: JsxAttributeLike): TypelessPropVal | undefined;
    static parseJsxElementName(element: JsxElement | JsxSelfClosingElement): string;
    /**
     * Recursively unwraps a ParenthesizedExpression to its last layer.
     */
    static unwrapParensExpression(parensExpression: ParenthesizedExpression): ParenthesizedExpression;
    static parseExportAssignment(exportAssignment: ExportAssignment): Identifier | ObjectLiteralExpression | ArrayLiteralExpression;
}
//# sourceMappingURL=StaticParsingHelpers.d.ts.map