import { SyntaxKind, Node, } from "ts-morph";
import { PropValueType } from "../../types";
import StaticParsingHelpers from "./StaticParsingHelpers";
import { TypeGuards } from "../../utils";
import StringUnionParsingHelper from "./StringUnionParsingHelper";
export var ParsedTypeKind;
(function (ParsedTypeKind) {
    ParsedTypeKind["Simple"] = "simple";
    ParsedTypeKind["Object"] = "object";
    ParsedTypeKind["StringLiteral"] = "stringLiteral";
    ParsedTypeKind["Array"] = "array";
})(ParsedTypeKind || (ParsedTypeKind = {}));
export var CustomTags;
(function (CustomTags) {
    CustomTags["Tooltip"] = "tooltip";
    CustomTags["DisplayName"] = "displayName";
})(CustomTags || (CustomTags = {}));
export default class TypeNodeParsingHelper {
    static parseShape(shapeNode, parseTypeReference) {
        const parsedType = this.parseShapeNode(shapeNode, parseTypeReference);
        return parsedType;
    }
    static parseShapeNode(shapeNode, parseTypeReference) {
        if (shapeNode.isKind(SyntaxKind.InterfaceDeclaration)) {
            return this.handleObjectType(shapeNode, parseTypeReference);
        }
        const name = StaticParsingHelpers.getEscapedName(shapeNode);
        const typeNode = shapeNode.getFirstChild(Node.isTypeNode);
        if (typeNode) {
            return this.parseTypeNode(typeNode, name, parseTypeReference);
        }
        const type = shapeNode.getStructure().type?.toString();
        if (!type) {
            throw new Error(`Unable to parse ${name} in node: ${shapeNode.getFullText()}`);
        }
        return this.handleTypeString(type, parseTypeReference);
    }
    static parseTypeNode(typeNode, name, parseTypeReference) {
        if (typeNode.isKind(SyntaxKind.TypeLiteral)) {
            return this.handleObjectType(typeNode, parseTypeReference);
        }
        else if (typeNode.isKind(SyntaxKind.ArrayType) ||
            (typeNode.isKind(SyntaxKind.TypeReference) &&
                typeNode.getTypeName().getText() === PropValueType.Array)) {
            return this.handleArrayType(typeNode, name, parseTypeReference);
        }
        else if (typeNode.isKind(SyntaxKind.LiteralType)) {
            const literal = typeNode.getLiteral();
            if (!literal.isKind(SyntaxKind.StringLiteral)) {
                throw new Error(`Only string literals are supported within type nodes. Found ${typeNode.getText()}`);
            }
            return {
                kind: ParsedTypeKind.StringLiteral,
                type: literal.getLiteralValue(),
            };
        }
        else if (typeNode.isKind(SyntaxKind.UnionType)) {
            const unionValues = StringUnionParsingHelper.parseStringUnion(typeNode, name, parseTypeReference);
            return {
                kind: ParsedTypeKind.Simple,
                type: PropValueType.string,
                unionValues,
            };
        }
        else {
            const type = typeNode.getText();
            return this.handleTypeString(type, parseTypeReference);
        }
    }
    static handleObjectType(shapeDeclaration, parseTypeReference) {
        const properties = shapeDeclaration.getProperties();
        const parsedShape = {};
        properties.forEach((p) => {
            const propertyName = StaticParsingHelpers.getEscapedName(p);
            const parsedType = this.parseShapeNode(p, parseTypeReference);
            const tooltip = this.getTagValue(p, CustomTags.Tooltip);
            const displayName = this.getTagValue(p, CustomTags.DisplayName);
            parsedShape[propertyName] = {
                ...parsedType,
                required: !p.hasQuestionToken(),
                ...(tooltip && { tooltip }),
                ...(displayName && { displayName }),
            };
        });
        return {
            kind: ParsedTypeKind.Object,
            type: parsedShape,
        };
    }
    static handleArrayType(typeNode, name, parseTypeReference) {
        function getElementTypeNode() {
            if (typeNode.isKind(SyntaxKind.ArrayType)) {
                return typeNode.getElementTypeNode();
            }
            const typeArgs = typeNode.getTypeArguments();
            if (typeArgs.length !== 1) {
                throw new Error(`One type param expected for Array type. Found ${typeArgs.length}.`);
            }
            return typeArgs[0];
        }
        const elementTypeNode = getElementTypeNode();
        return {
            kind: ParsedTypeKind.Array,
            type: this.parseTypeNode(elementTypeNode, name, parseTypeReference),
        };
    }
    static handleTypeString(type, parseTypeReference) {
        if (!TypeGuards.isPropValueType(type)) {
            const externalParsedType = parseTypeReference(type);
            if (externalParsedType) {
                return externalParsedType;
            }
        }
        return {
            kind: ParsedTypeKind.Simple,
            type,
        };
    }
    static getTagValue(propertySignature, customTag) {
        const firstDoc = propertySignature.getJsDocs()[0];
        if (!firstDoc) {
            return;
        }
        for (const tag of firstDoc.getTags()) {
            const commentText = tag.getCommentText();
            if (tag.getTagName() === customTag && commentText) {
                return commentText;
            }
        }
    }
}
//# sourceMappingURL=TypeNodeParsingHelper.js.map