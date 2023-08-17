import { ResponseType, } from "../types";
/**
 * Registers a listener for the given messageId,
 * and handle response from server back to client.
 */
export function registerListener(server, messageId, listener) {
    server.middlewares.use(async (req, res, next) => {
        if (req.url === `/${messageId}`) {
            const requestBody = await parseRequestBody(req);
            const responsePayload = await getResponsePayload(messageId, () => listener(requestBody));
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(responsePayload));
        }
        else {
            next();
        }
    });
}
async function getResponsePayload(messageId, handler) {
    try {
        return handler();
    }
    catch (error) {
        let msg = `Error occurred for event ${messageId}`;
        if (typeof error === "string") {
            msg = error;
        }
        else if (error instanceof Error) {
            msg = error.message;
        }
        console.error(error);
        return {
            type: ResponseType.Fatal,
            msg,
        };
    }
}
function parseRequestBody(req) {
    return new Promise((resolve) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body = [];
        req
            .on("data", (chunk) => body.push(chunk))
            .on("end", () => {
            const stringifiedBody = Buffer.concat(body).toString();
            const requestBody = JSON.parse(stringifiedBody);
            resolve(requestBody);
        });
    });
}
//# sourceMappingURL=registerListener.js.map