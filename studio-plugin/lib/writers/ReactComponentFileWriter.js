import { StructureKind, SyntaxKind, Writers, } from "ts-morph";
import { ComponentStateKind, PropValueKind, PropValueType, } from "../types";
import ComponentTreeHelpers from "../utils/ComponentTreeHelpers";
import { TypeGuards } from "../utils";
import camelCase from "camelcase";
import { CustomTags } from "../parsers/helpers/TypeNodeParsingHelper";
/**
 * ReactComponentFileWriter is a class for housing data
 * updating logic for a React component file (e.g. ModuleFile or PageFile).
 */
export default class ReactComponentFileWriter {
    componentName;
    studioSourceFileWriter;
    studioSourceFileParser;
    constructor(componentName, studioSourceFileWriter, studioSourceFileParser) {
        this.componentName = componentName;
        this.studioSourceFileWriter = studioSourceFileWriter;
        this.studioSourceFileParser = studioSourceFileParser;
    }
    reactComponentNameSanitizer(name) {
        name = camelCase(name, { pascalCase: true });
        const nonAlphaNumeric = /[\W]/g;
        const firstNonLetters = /^[^a-zA-Z]*/;
        name = name.replaceAll(nonAlphaNumeric, "");
        name = name.replace(firstNonLetters, "");
        return name
            ? name[0].toUpperCase() + name.slice(1)
            : "PageDefaultFromInvalidInput";
    }
    createComponentFunction() {
        this.componentName = this.reactComponentNameSanitizer(this.componentName);
        const functionDeclaration = this.studioSourceFileWriter.createDefaultFunction(this.componentName);
        functionDeclaration.addStatements([Writers.returnStatement("<></>")]);
        return functionDeclaration;
    }
    createProps(props) {
        let propsString = "";
        Object.keys(props).forEach((propName) => {
            const propVal = props[propName];
            const value = this.parsePropVal(propVal);
            if (value === "") {
                return;
            }
            if (this.shouldUseStringSyntaxForProp(propVal)) {
                propsString += `${propName}=${value} `;
            }
            else {
                propsString += `${propName}={${value}} `;
            }
        });
        return propsString;
    }
    parsePropVal = (propVal) => {
        const { value, valueType, kind } = propVal;
        if (this.shouldUseStringSyntaxForProp(propVal)) {
            const escapedValueWithDoubleQuotes = JSON.stringify(value);
            return escapedValueWithDoubleQuotes;
        }
        else if (valueType === PropValueType.Object) {
            const stringifiedObject = Object.keys(value).reduce((stringifiedObject, keyName) => {
                const childPropVal = value[keyName];
                stringifiedObject +=
                    JSON.stringify(keyName) +
                        ": " +
                        this.parsePropVal(childPropVal) +
                        ",\n";
                return stringifiedObject;
            }, "");
            return "{" + stringifiedObject + "}";
        }
        else if (valueType === PropValueType.Array &&
            kind === PropValueKind.Literal) {
            const stringifiedArray = value.map(this.parsePropVal).join(", ");
            return "[" + stringifiedArray + "]";
        }
        else {
            return value;
        }
    };
    shouldUseStringSyntaxForProp({ kind, valueType }) {
        const isRepresentedAsString = valueType === PropValueType.string ||
            valueType === PropValueType.HexColor;
        return kind === PropValueKind.Literal && isRepresentedAsString;
    }
    createJsxSelfClosingElement(componentName, props) {
        return `<${componentName} ${this.createProps(props)}/>`;
    }
    createReturnStatement(componentTree) {
        const elements = ComponentTreeHelpers.mapComponentTree(componentTree, (c, children) => {
            if (c.kind === ComponentStateKind.Error) {
                return c.fullText;
            }
            else if (c.kind === ComponentStateKind.Fragment) {
                return "<>\n" + children.join("\n") + "</>";
            }
            else if (TypeGuards.isRepeaterState(c)) {
                const { componentName, props } = c.repeatedComponent;
                return (`{${c.listExpression}.map((item, index) => ` +
                    this.createJsxSelfClosingElement(componentName, {
                        ...props,
                        key: {
                            kind: PropValueKind.Expression,
                            valueType: PropValueType.string,
                            value: "index",
                        },
                    }) +
                    `)}`);
            }
            else if (children.length === 0) {
                return this.createJsxSelfClosingElement(c.componentName, c.props);
            }
            else {
                return (`<${c.componentName} ` +
                    this.createProps(c.props) +
                    ">\n" +
                    children.join("\n") +
                    `</${c.componentName}>`);
            }
        });
        const joinedElements = elements.join("\n");
        const wrappedElements = elements.length > 1 || TypeGuards.isRepeaterState(componentTree[0])
            ? `<>${joinedElements}</>`
            : joinedElements;
        return Writers.returnStatement(wrappedElements);
    }
    updateReturnStatement(functionComponent, componentTree) {
        const returnStatementIndex = functionComponent
            .getDescendantStatements()
            .findIndex((n) => n.isKind(SyntaxKind.ReturnStatement));
        if (returnStatementIndex >= 0) {
            functionComponent.removeStatement(returnStatementIndex);
        }
        if (componentTree.length > 0) {
            const newReturnStatement = this.createReturnStatement(componentTree);
            functionComponent.addStatements(newReturnStatement);
        }
    }
    updatePropInterface(propShape) {
        const getTypeString = (propMetadata) => {
            if (propMetadata.type === PropValueType.Record) {
                return "Record<string, any>";
            }
            else if (propMetadata.type === PropValueType.Object) {
                const stringifiedShape = Object.entries(propMetadata.shape).reduce((stringifiedShape, [propName, childMetadata]) => {
                    stringifiedShape += propName;
                    if (!childMetadata.required) {
                        stringifiedShape += "?";
                    }
                    stringifiedShape += ":" + getTypeString(childMetadata) + ",\n";
                    return stringifiedShape;
                }, "");
                return "{" + stringifiedShape + "}";
            }
            else {
                return propMetadata.type;
            }
        };
        const interfaceName = `${this.componentName}Props`;
        const getProperties = (propShape) => Object.entries(propShape).map(([key, propMetadata]) => {
            const docs = this.reconstructDocs(propMetadata.tooltip, propMetadata.displayName);
            return {
                name: key,
                type: getTypeString(propMetadata),
                hasQuestionToken: !propMetadata.required,
                ...docs,
            };
        });
        const properties = getProperties(propShape);
        this.studioSourceFileWriter.updateInterface(interfaceName, properties);
    }
    updateInitialProps(initialProps) {
        this.studioSourceFileWriter.updateVariableStatement("initialProps", this.studioSourceFileWriter.createPropsObjectLiteralWriter(initialProps), `${this.componentName}Props`);
    }
    /**
     * Update a React component file, which include:
     * - file imports
     * - const variable "initialProps"
     * - component's prop interface `${componentName}Props`
     * - component's parameter and return statement
     */
    updateFile({ componentTree, moduleMetadata, cssImports, onFileUpdate, defaultImports, propArgs, }) {
        let defaultExport;
        try {
            defaultExport =
                this.studioSourceFileParser.getDefaultExportReactComponent();
        }
        catch (e) {
            if (/^Error getting default export: No declaration node found/.test(e.message)) {
                defaultExport = this.createComponentFunction();
            }
            else {
                throw e;
            }
        }
        const functionComponent = defaultExport.isKind(SyntaxKind.VariableDeclaration)
            ? defaultExport.getFirstDescendantByKindOrThrow(SyntaxKind.ArrowFunction)
            : defaultExport;
        onFileUpdate?.(functionComponent);
        if (moduleMetadata) {
            const { initialProps, propShape } = moduleMetadata;
            if (initialProps) {
                this.updateInitialProps(initialProps);
            }
            if (propShape && Object.keys(propShape).length !== 0) {
                this.updatePropInterface(propShape);
                this.studioSourceFileWriter.updateFunctionParameter(functionComponent, `${this.componentName}Props`, propArgs);
            }
        }
        this.updateReturnStatement(functionComponent, componentTree);
        this.studioSourceFileWriter.updateFileImports({}, cssImports, defaultImports);
        this.studioSourceFileWriter.writeToFile();
    }
    reconstructDocs(tooltip, displayName) {
        if (!tooltip && !displayName) {
            return;
        }
        const tags = [];
        if (tooltip) {
            tags.push({ tagName: CustomTags.Tooltip, text: tooltip });
        }
        if (displayName) {
            tags.push({ tagName: CustomTags.DisplayName, text: displayName });
        }
        return {
            docs: [{ tags, kind: StructureKind.JSDoc }],
        };
    }
}
//# sourceMappingURL=ReactComponentFileWriter.js.map