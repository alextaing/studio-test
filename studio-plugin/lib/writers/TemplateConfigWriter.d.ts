import { ArrowFunction, FunctionDeclaration } from "ts-morph";
import { ComponentState } from "../types/ComponentState";
import StudioSourceFileWriter from "./StudioSourceFileWriter";
import PagesJsWriter from "./PagesJsWriter";
import { PagesJsState } from "../types";
import TemplateConfigParser from "../parsers/TemplateConfigParser";
type EntityPageState = PagesJsState & Required<Pick<PagesJsState, "streamScope">>;
/**
 * TemplateConfigWriter is a class for housing the updating logic for the
 * template config in the PageFile for an entity page.
 */
export default class TemplateConfigWriter {
    private studioSourceFileWriter;
    private templateConfigParser;
    private pagesJsWriter;
    private pageName;
    constructor(studioSourceFileWriter: StudioSourceFileWriter, templateConfigParser: TemplateConfigParser, pagesJsWriter: PagesJsWriter, pageName: string);
    /**
     * Extracts stream's data expressions used in the provided component tree,
     * in the form of `document.${string}`.
     *
     * @param componentTree - the states of the page's component tree
     * @param getPathValue - the return value of the getPath function
     * @returns a set of the stream's data expressions
     */
    private getUsedStreamDocumentPaths;
    /**
     * Creates a Pages template config by merging current template config, if
     * defined, with a new template configuration used by the constructed page
     * from Studio.
     *
     * @param componentTree - the states of the page's component tree
     * @param entityPageState - the PagesJS-specific state of the entity page
     * @returns the updated template config
     */
    private getUpdatedTemplateConfig;
    /**
     * Updates the template configuration by mutating the current template config
     * or adding a template config definition to the original sourceFile of the
     * entity page.
     *
     * @param componentTree - the states of the page's component tree
     * @param entityPageState - the PagesJS-specific state of the entity page
     * @param componentFunction - the default export React component function
     */
    updateTemplateConfig(componentTree: ComponentState[], entityPageState: EntityPageState, componentFunction: FunctionDeclaration | ArrowFunction): void;
    private addParametersAndImports;
    isEntityPageState(pagesJsState: PagesJsState | undefined): pagesJsState is EntityPageState;
}
export {};
//# sourceMappingURL=TemplateConfigWriter.d.ts.map