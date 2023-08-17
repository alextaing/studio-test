import { ViteDevServer } from "vite";
import { MessageID, ResponseEventMap, StudioEventMap } from "../types";
/**
 * Registers a listener for the given messageId,
 * and handle response from server back to client.
 */
export declare function registerListener<T extends MessageID>(server: ViteDevServer, messageId: T, listener: (data: StudioEventMap[T]) => Promise<ResponseEventMap[T]> | ResponseEventMap[T]): void;
//# sourceMappingURL=registerListener.d.ts.map