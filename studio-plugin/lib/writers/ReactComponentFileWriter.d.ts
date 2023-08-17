import { ArrowFunction, FunctionDeclaration, JSDocableNodeStructure } from "ts-morph";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser";
import { ComponentState, ModuleMetadata } from "../types";
import StudioSourceFileWriter from "./StudioSourceFileWriter";
/**
 * ReactComponentFileWriter is a class for housing data
 * updating logic for a React component file (e.g. ModuleFile or PageFile).
 */
export default class ReactComponentFileWriter {
    private componentName;
    private studioSourceFileWriter;
    private studioSourceFileParser;
    constructor(componentName: string, studioSourceFileWriter: StudioSourceFileWriter, studioSourceFileParser: StudioSourceFileParser);
    private reactComponentNameSanitizer;
    private createComponentFunction;
    private createProps;
    private parsePropVal;
    private shouldUseStringSyntaxForProp;
    private createJsxSelfClosingElement;
    private createReturnStatement;
    private updateReturnStatement;
    private updatePropInterface;
    private updateInitialProps;
    /**
     * Update a React component file, which include:
     * - file imports
     * - const variable "initialProps"
     * - component's prop interface `${componentName}Props`
     * - component's parameter and return statement
     */
    updateFile({ componentTree, moduleMetadata, cssImports, onFileUpdate, defaultImports, propArgs, }: {
        componentTree: ComponentState[];
        moduleMetadata?: ModuleMetadata;
        cssImports?: string[];
        onFileUpdate?: (functionComponent: FunctionDeclaration | ArrowFunction) => void;
        defaultImports?: {
            name: string;
            moduleSpecifier: string;
        }[];
        propArgs?: string[] | string;
    }): void;
    reconstructDocs(tooltip?: string, displayName?: string): JSDocableNodeStructure | undefined;
}
//# sourceMappingURL=ReactComponentFileWriter.d.ts.map