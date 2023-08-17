import { PAGESJS_TEMPLATE_PROPS_TYPE, STREAM_LOCALIZATION, TEMPLATE_CONFIG_VARIABLE_NAME, } from "../constants";
import pagesJSFieldsMerger from "../utils/StreamConfigFieldsMerger";
import { ComponentTreeHelpers } from "../utils";
const TEMPLATE_CONFIG_VARIABLE_TYPE = "TemplateConfig";
/**
 * TemplateConfigWriter is a class for housing the updating logic for the
 * template config in the PageFile for an entity page.
 */
export default class TemplateConfigWriter {
    studioSourceFileWriter;
    templateConfigParser;
    pagesJsWriter;
    pageName;
    constructor(studioSourceFileWriter, templateConfigParser, pagesJsWriter, pageName) {
        this.studioSourceFileWriter = studioSourceFileWriter;
        this.templateConfigParser = templateConfigParser;
        this.pagesJsWriter = pagesJsWriter;
        this.pageName = pageName;
    }
    /**
     * Extracts stream's data expressions used in the provided component tree,
     * in the form of `document.${string}`.
     *
     * @param componentTree - the states of the page's component tree
     * @param getPathValue - the return value of the getPath function
     * @returns a set of the stream's data expressions
     */
    getUsedStreamDocumentPaths(componentTree, getPathValue) {
        const expressions = ComponentTreeHelpers.getComponentTreeExpressions(componentTree);
        if (getPathValue) {
            expressions.push(...ComponentTreeHelpers.getExpressionUsagesFromPropVal(getPathValue));
        }
        const streamDataExpressions = ComponentTreeHelpers.selectExpressionsWithSource(expressions, "document");
        return new Set(streamDataExpressions);
    }
    /**
     * Creates a Pages template config by merging current template config, if
     * defined, with a new template configuration used by the constructed page
     * from Studio.
     *
     * @param componentTree - the states of the page's component tree
     * @param entityPageState - the PagesJS-specific state of the entity page
     * @returns the updated template config
     */
    getUpdatedTemplateConfig(componentTree, entityPageState) {
        const currentTemplateConfig = this.templateConfigParser.getTemplateConfig();
        const usedDocumentPaths = this.getUsedStreamDocumentPaths(componentTree, entityPageState.getPathValue);
        const currentFields = currentTemplateConfig?.stream?.fields || [];
        const newFields = [...usedDocumentPaths]
            // Stream config's fields do not allow specifying an index or sub-field of a field.
            .map((documentPath) => /^document\.([^[.]+)/.exec(documentPath))
            .filter((matchResults) => matchResults && matchResults.length >= 2)
            .map((matchResults) => matchResults[1]);
        return {
            ...currentTemplateConfig,
            stream: {
                $id: `studio-stream-id-${this.pageName}`,
                localization: STREAM_LOCALIZATION,
                ...currentTemplateConfig?.stream,
                filter: entityPageState.streamScope,
                fields: pagesJSFieldsMerger(currentFields, newFields),
            },
        };
    }
    /**
     * Updates the template configuration by mutating the current template config
     * or adding a template config definition to the original sourceFile of the
     * entity page.
     *
     * @param componentTree - the states of the page's component tree
     * @param entityPageState - the PagesJS-specific state of the entity page
     * @param componentFunction - the default export React component function
     */
    updateTemplateConfig(componentTree, entityPageState, componentFunction) {
        const updatedTemplateConfig = this.getUpdatedTemplateConfig(componentTree, entityPageState);
        const stringifiedConfig = JSON.stringify(updatedTemplateConfig);
        this.studioSourceFileWriter.updateVariableStatement(TEMPLATE_CONFIG_VARIABLE_NAME, stringifiedConfig, TEMPLATE_CONFIG_VARIABLE_TYPE);
        this.addParametersAndImports(componentTree, componentFunction);
    }
    addParametersAndImports(componentTree, componentFunction) {
        this.pagesJsWriter.addPagesJsImports([TEMPLATE_CONFIG_VARIABLE_TYPE]);
        const usesDocument = ComponentTreeHelpers.usesExpressionSource(componentTree, "document");
        if (usesDocument) {
            this.pagesJsWriter.addTemplateParameter(componentFunction);
            this.pagesJsWriter.addPagesJsImports([PAGESJS_TEMPLATE_PROPS_TYPE]);
        }
    }
    isEntityPageState(pagesJsState) {
        return !!pagesJsState?.streamScope;
    }
}
//# sourceMappingURL=TemplateConfigWriter.js.map