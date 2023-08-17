import StudioSourceFileWriter from "./StudioSourceFileWriter";
import GetPathParser from "../parsers/GetPathParser";
import { GetPathVal } from "../types/PageState";
import PagesJsWriter from "./PagesJsWriter";
/**
 * GetPathWriter is a class for housing the updating logic for the getPath
 * function in a PageFile.
 */
export default class GetPathWriter {
    private studioSourceFileWriter;
    private getPathParser;
    private pagesJsWriter;
    constructor(studioSourceFileWriter: StudioSourceFileWriter, getPathParser: GetPathParser, pagesJsWriter: PagesJsWriter);
    /**
     * Updates the getPath function by replacing the returned string's value or
     * adding a new getPath function to the original sourceFile.
     *
     * @param getPathValue - the new value to return from the getPath function
     */
    updateGetPath(getPathValue: GetPathVal): void;
    private constructStringNodeText;
}
//# sourceMappingURL=GetPathWriter.d.ts.map