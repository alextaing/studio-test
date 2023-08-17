import { SyntaxKind, } from "ts-morph";
import { ComponentStateKind, } from "../types/ComponentState";
import { v4 } from "uuid";
import { FileMetadataKind } from "../types";
import StaticParsingHelpers from "./helpers/StaticParsingHelpers";
import TypeGuards from "../utils/TypeGuards";
import MissingPropsChecker from "./MissingPropsChecker";
export default class ComponentTreeParser {
    studioSourceFileParser;
    getFileMetadata;
    constructor(studioSourceFileParser, getFileMetadata) {
        this.studioSourceFileParser = studioSourceFileParser;
        this.getFileMetadata = getFileMetadata;
    }
    parseComponentTree(defaultImports) {
        const defaultExport = this.studioSourceFileParser.getDefaultExportReactComponent();
        const returnStatement = defaultExport.getFirstDescendantByKind(SyntaxKind.ReturnStatement);
        if (!returnStatement) {
            return [];
        }
        const JsxNodeWrapper = returnStatement.getFirstChildByKind(SyntaxKind.ParenthesizedExpression) ??
            returnStatement;
        const topLevelJsxNode = JsxNodeWrapper.getChildren().find((n) => n.isKind(SyntaxKind.JsxElement) ||
            n.isKind(SyntaxKind.JsxFragment) ||
            n.isKind(SyntaxKind.JsxSelfClosingElement));
        if (!topLevelJsxNode) {
            throw new Error("Unable to find top-level JSX element or JSX fragment type" +
                ` in the default export at path: "${this.studioSourceFileParser.getFilepath()}"`);
        }
        return StaticParsingHelpers.parseJsxChild(topLevelJsxNode, (child, parent) => this.parseComponentState(child, defaultImports, parent));
    }
    parseComponentState(component, defaultImports, parent) {
        const commonComponentState = {
            parentUUID: parent?.uuid,
            uuid: v4(),
        };
        if (component.isKind(SyntaxKind.JsxExpression)) {
            const { selfClosingElement, listExpression } = StaticParsingHelpers.parseJsxExpression(component);
            const parsedRepeaterElement = this.parseRepeaterElement(defaultImports, selfClosingElement, listExpression);
            return {
                ...commonComponentState,
                ...parsedRepeaterElement,
            };
        }
        if (!TypeGuards.isNotFragmentElement(component)) {
            return {
                ...commonComponentState,
                kind: ComponentStateKind.Fragment,
            };
        }
        const componentName = StaticParsingHelpers.parseJsxElementName(component);
        const parsedElement = this.parseElement(component, componentName, defaultImports);
        return {
            ...commonComponentState,
            ...parsedElement,
            componentName,
        };
    }
    parseRepeaterElement(defaultImports, repeatedComponent, listExpression) {
        const componentName = StaticParsingHelpers.parseJsxElementName(repeatedComponent);
        const parsedRepeatedComponent = this.parseElement(repeatedComponent, componentName, defaultImports);
        if (parsedRepeatedComponent.kind === ComponentStateKind.BuiltIn) {
            throw new Error("Error parsing map expression: repetition of built-in components is not supported.");
        }
        return {
            kind: ComponentStateKind.Repeater,
            listExpression,
            repeatedComponent: {
                ...parsedRepeatedComponent,
                componentName,
            },
        };
    }
    parseElement(component, componentName, defaultImports) {
        const attributes = component.isKind(SyntaxKind.JsxSelfClosingElement)
            ? component.getAttributes()
            : component.getOpeningElement().getAttributes();
        const filepath = Object.keys(defaultImports).find((importIdentifier) => {
            return defaultImports[importIdentifier] === componentName;
        });
        const assumeIsBuiltInElement = filepath === undefined;
        if (assumeIsBuiltInElement) {
            if (attributes.length > 0) {
                console.warn(`Props for builtIn element: '${componentName}' are currently not supported.`);
            }
            return {
                kind: ComponentStateKind.BuiltIn,
                props: {},
            };
        }
        const fileMetadata = this.getFileMetadata(filepath);
        if (fileMetadata.kind === FileMetadataKind.Error) {
            const props = {};
            attributes.forEach((attribute) => {
                const propName = StaticParsingHelpers.parseJsxAttributeName(attribute);
                const parsedAttribute = StaticParsingHelpers.parseJsxAttribute(attribute);
                if (parsedAttribute !== undefined) {
                    props[propName] = parsedAttribute;
                }
            });
            return {
                kind: ComponentStateKind.Error,
                metadataUUID: fileMetadata.metadataUUID,
                uuid: v4(),
                fullText: component.getFullText(),
                message: fileMetadata.message,
                props,
            };
        }
        const { kind: fileMetadataKind, metadataUUID, propShape } = fileMetadata;
        const componentStateKind = fileMetadataKind === FileMetadataKind.Module
            ? ComponentStateKind.Module
            : ComponentStateKind.Standard;
        const props = StaticParsingHelpers.parseJsxAttributes(attributes, propShape);
        const missingProps = MissingPropsChecker.getMissingRequiredProps(props, propShape);
        if (missingProps.length) {
            const missingPropsString = missingProps.join(", ");
            return {
                kind: ComponentStateKind.Error,
                metadataUUID: fileMetadata.metadataUUID,
                uuid: v4(),
                fullText: component.getFullText(),
                message: "Prop(s) missing: " + missingPropsString,
                props,
            };
        }
        return {
            kind: componentStateKind,
            metadataUUID,
            props,
        };
    }
}
//# sourceMappingURL=ComponentTreeParser.js.map