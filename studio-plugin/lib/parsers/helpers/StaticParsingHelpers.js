import { SyntaxKind, } from "ts-morph";
import { PropValueKind, PropValueType, } from "../../types/PropValues";
import { SpecialReactProps, } from "../../types/PropShape";
import TypeGuards from "../../utils/TypeGuards";
import TsMorphHelpers from "./TsMorphHelpers";
import RepeaterParsingHelpers from "./RepeaterParsingHelpers";
/**
 * StaticParsingHelpers is a static class for housing lower level details for parsing
 * files within Studio.
 */
class StaticParsingHelpers {
    static addTypesToPropVal(typelessPropVal, propType) {
        const valueType = propType.type;
        if (valueType === PropValueType.Array &&
            Array.isArray(typelessPropVal.value)) {
            const arrayPropVals = typelessPropVal.value.map((val) => this.addTypesToPropVal(val, propType.itemType));
            const arrayPropVal = {
                kind: PropValueKind.Literal,
                valueType,
                value: arrayPropVals,
            };
            TypeGuards.assertIsValidPropVal(arrayPropVal);
            return arrayPropVal;
        }
        else if (valueType === PropValueType.Object &&
            typeof typelessPropVal.value === "object" &&
            !Array.isArray(typelessPropVal.value)) {
            const getPropValues = (typelessValues) => {
                const propValues = {};
                Object.entries(typelessValues).forEach(([propName, value]) => {
                    const childMetadata = propType.shape[propName];
                    propValues[propName] = this.addTypesToPropVal(value, childMetadata);
                });
                return propValues;
            };
            return {
                kind: PropValueKind.Literal,
                valueType,
                value: getPropValues(typelessPropVal.value),
            };
        }
        else {
            const propVal = {
                ...typelessPropVal,
                valueType,
            };
            TypeGuards.assertIsValidPropVal(propVal);
            return propVal;
        }
    }
    static parseInitializer = (initializer) => {
        if (initializer.isKind(SyntaxKind.StringLiteral)) {
            return {
                value: initializer.compilerNode.text,
                kind: PropValueKind.Literal,
            };
        }
        const expression = initializer.isKind(SyntaxKind.JsxExpression)
            ? initializer.getExpressionOrThrow()
            : initializer;
        if (expression.getText() === "undefined") {
            return;
        }
        else if (expression.isKind(SyntaxKind.PropertyAccessExpression) ||
            expression.isKind(SyntaxKind.TemplateExpression) ||
            expression.isKind(SyntaxKind.ElementAccessExpression) ||
            expression.isKind(SyntaxKind.Identifier) ||
            expression.isKind(SyntaxKind.NoSubstitutionTemplateLiteral)) {
            return { value: expression.getText(), kind: PropValueKind.Expression };
        }
        else if (expression.isKind(SyntaxKind.NumericLiteral) ||
            expression.isKind(SyntaxKind.FalseKeyword) ||
            expression.isKind(SyntaxKind.TrueKeyword)) {
            return {
                value: expression.getLiteralValue(),
                kind: PropValueKind.Literal,
            };
        }
        else if (expression.isKind(SyntaxKind.ObjectLiteralExpression)) {
            return {
                value: this.parseObjectLiteral(expression),
                kind: PropValueKind.Literal,
            };
        }
        else if (expression.isKind(SyntaxKind.ArrayLiteralExpression)) {
            return {
                value: expression
                    .getElements()
                    .map(this.parseInitializer)
                    .filter((el) => el !== undefined),
                kind: PropValueKind.Literal,
            };
        }
        else if (expression.isKind(SyntaxKind.PrefixUnaryExpression) &&
            expression.getOperatorToken() === SyntaxKind.MinusToken &&
            expression.getOperand().isKind(SyntaxKind.NumericLiteral)) {
            return {
                value: parseInt(expression.getOperand().getFullText()) * -1,
                kind: PropValueKind.Literal,
            };
        }
        else {
            throw new Error(`Unrecognized prop value ${initializer.getFullText()} ` +
                `with kind: ${expression.getKindName()}`);
        }
    };
    static parseObjectLiteral(objectLiteral) {
        const parsedValues = {};
        objectLiteral.getProperties().forEach((p) => {
            if (!p.isKind(SyntaxKind.PropertyAssignment)) {
                throw new Error(`Unrecognized node type: ${p.getKindName()} in object literal ${p.getFullText()}`);
            }
            const key = this.getEscapedName(p);
            const value = StaticParsingHelpers.parseInitializer(p.getInitializerOrThrow());
            if (value !== undefined) {
                parsedValues[key] = value;
            }
        });
        return parsedValues;
    }
    static parseImport(importDeclaration) {
        const source = importDeclaration.getModuleSpecifierValue();
        const importClause = importDeclaration.getImportClause();
        //  Ignore imports like `import 'index.css'` which lack an import clause
        if (!importClause) {
            return {
                source,
                namedImports: [],
            };
        }
        const defaultImport = importClause
            .getDefaultImport()
            ?.getText();
        const namedImports = importClause
            .getNamedImports()
            .map((n) => n.getName());
        return {
            source,
            namedImports,
            defaultImport,
        };
    }
    static getEscapedName(p) {
        return p.getSymbolOrThrow().getEscapedName();
    }
    static parseJsxChild(c, handleJsxChild, parent) {
        // All whitespace in Jsx is also considered JsxText, for example indentation
        if (c.isKind(SyntaxKind.JsxText)) {
            if (c.getLiteralText().trim().length) {
                throw new Error(`Found JsxText with content "${c
                    .getLiteralText()
                    .trim()}". JsxText is not currently supported.`);
            }
            return [];
        }
        const self = handleJsxChild(c, parent);
        if (c.isKind(SyntaxKind.JsxSelfClosingElement) ||
            c.isKind(SyntaxKind.JsxExpression)) {
            return [self];
        }
        const children = c
            .getJsxChildren()
            .flatMap((child) => this.parseJsxChild(child, handleJsxChild, self))
            .filter((child) => !!child);
        return [self, ...children];
    }
    static parseJsxExpression(c) {
        const isMapExpression = c
            .getFirstDescendantByKind(SyntaxKind.PropertyAccessExpression)
            ?.getLastChildByKind(SyntaxKind.Identifier)
            ?.getText() === "map";
        if (!isMapExpression) {
            throw new Error(`Jsx nodes of kind "${c.getKindName()}" are not supported for direct use` +
                " in page files except for `map` function expressions.");
        }
        return RepeaterParsingHelpers.parseMapExpression(c);
    }
    static parseJsxAttributes(attributes, propShape) {
        const propValues = {};
        attributes.forEach((jsxAttribute) => {
            const propName = this.parseJsxAttributeName(jsxAttribute);
            if (Object.values(SpecialReactProps).includes(propName)) {
                return;
            }
            const propMetadata = propShape?.[propName];
            if (!propMetadata) {
                throw new Error(`Could not find prop metadata for: \`${jsxAttribute.getFullText()}\` with prop shape ${JSON.stringify(propShape, null, 2)}`);
            }
            const parsedAttribute = this.parseJsxAttribute(jsxAttribute);
            if (parsedAttribute !== undefined) {
                const propValue = StaticParsingHelpers.addTypesToPropVal(parsedAttribute, propMetadata);
                propValues[propName] = propValue;
            }
        });
        return propValues;
    }
    static assertIsJsxAttribute(jsxAttributeLike) {
        if (jsxAttributeLike.isKind(SyntaxKind.JsxSpreadAttribute)) {
            throw new Error(`Error parsing \`${jsxAttributeLike.getText()}\`:` +
                " JsxSpreadAttribute is not currently supported.");
        }
    }
    static parseJsxAttributeName(jsxAttribute) {
        this.assertIsJsxAttribute(jsxAttribute);
        const propName = jsxAttribute
            .getFirstDescendantByKind(SyntaxKind.Identifier)
            ?.getText();
        if (!propName) {
            throw new Error("Could not parse jsx attribute prop name: " + jsxAttribute.getFullText());
        }
        return propName;
    }
    static parseJsxAttribute(jsxAttribute) {
        this.assertIsJsxAttribute(jsxAttribute);
        const parsedProp = StaticParsingHelpers.parseInitializer(jsxAttribute.getInitializerOrThrow());
        if (parsedProp === undefined) {
            return;
        }
        const { value, kind } = parsedProp;
        if (kind === PropValueKind.Expression) {
            if (typeof value !== "string") {
                throw new Error(`Expected a string for expression prop ${jsxAttribute.getText()}.`);
            }
            return { value, kind: PropValueKind.Expression };
        }
        return {
            value,
            kind: PropValueKind.Literal,
        };
    }
    static parseJsxElementName(element) {
        return element.isKind(SyntaxKind.JsxSelfClosingElement)
            ? element.getTagNameNode().getText()
            : element.getOpeningElement().getTagNameNode().getText();
    }
    /**
     * Recursively unwraps a ParenthesizedExpression to its last layer.
     */
    static unwrapParensExpression(parensExpression) {
        let node = parensExpression;
        let nextNode = node;
        while (nextNode) {
            nextNode = nextNode.getFirstChildByKind(SyntaxKind.ParenthesizedExpression);
            if (nextNode) {
                node = nextNode;
            }
        }
        return node;
    }
    static parseExportAssignment(exportAssignment) {
        let parentNode = exportAssignment;
        const asExpression = parentNode.getFirstChildByKind(SyntaxKind.AsExpression);
        if (asExpression) {
            parentNode = asExpression;
        }
        const parensExpression = parentNode.getFirstChildByKind(SyntaxKind.ParenthesizedExpression);
        if (parensExpression) {
            parentNode =
                StaticParsingHelpers.unwrapParensExpression(parensExpression);
        }
        return TsMorphHelpers.getFirstChildOfKindOrThrow(parentNode, SyntaxKind.ObjectLiteralExpression, SyntaxKind.ArrayLiteralExpression, SyntaxKind.Identifier);
    }
}
export default StaticParsingHelpers;
//# sourceMappingURL=StaticParsingHelpers.js.map