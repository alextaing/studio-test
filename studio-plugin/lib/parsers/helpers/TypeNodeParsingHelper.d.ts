import { InterfaceDeclaration, TypeAliasDeclaration } from "ts-morph";
export type ParsedType = SimpleParsedType | ObjectParsedType | StringLiteralType | ArrayParsedType;
export type SimpleParsedType = {
    kind: ParsedTypeKind.Simple;
    type: string;
    unionValues?: string[];
};
type ObjectParsedType = {
    kind: ParsedTypeKind.Object;
    type: ParsedShape;
    unionValues?: never;
};
type StringLiteralType = {
    kind: ParsedTypeKind.StringLiteral;
    type: string;
    unionValues?: never;
};
type ArrayParsedType = {
    kind: ParsedTypeKind.Array;
    type: ParsedType;
    unionValues?: never;
};
export type ParsedShape = {
    [key: string]: ParsedProperty;
};
export type ParsedProperty = ParsedType & {
    tooltip?: string;
    displayName?: string;
    required: boolean;
};
export declare enum ParsedTypeKind {
    Simple = "simple",
    Object = "object",
    StringLiteral = "stringLiteral",
    Array = "array"
}
export declare enum CustomTags {
    Tooltip = "tooltip",
    DisplayName = "displayName"
}
export default class TypeNodeParsingHelper {
    static parseShape(shapeNode: InterfaceDeclaration | TypeAliasDeclaration, parseTypeReference: (identifier: string) => ParsedType | undefined): ParsedType;
    private static parseShapeNode;
    private static parseTypeNode;
    private static handleObjectType;
    private static handleArrayType;
    private static handleTypeString;
    private static getTagValue;
}
export {};
//# sourceMappingURL=TypeNodeParsingHelper.d.ts.map