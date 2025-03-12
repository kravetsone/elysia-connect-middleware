import Connect from "connect";
import { Elysia } from "elysia";
import { createResponse } from "node-mocks-http";
import type { ConnectMiddleware } from "./types";
import {
	transformRequestToIncomingMessage,
	transformResponseToServerResponse,
} from "./utils";

export function connect(...middlewares: ConnectMiddleware[]) {
    const connectApp = Connect();

    for (const middleware of middlewares) {
		// @ts-expect-error
        connectApp.use(middleware);
    }

    return new Elysia({
        name: "connect",
        seed: middlewares,
    }).onRequest(async function processConnectMiddlewares({ request, set }) {
        return await new Promise<Response | undefined>(async (resolve) => {
            const message = await transformRequestToIncomingMessage(request);
			
            // @ts-expect-error
			message.app = connectApp;

            const response = createResponse();
            const end = response.end;

            // @ts-expect-error
			response.end = async (...args: Parameters<typeof response.end>) => {
                const call = end.call(response, ...args);
                const webResponse = transformResponseToServerResponse(response);
                resolve(webResponse);

                return call;
            };

            connectApp.handle(message, response, async () => {
                const webResponse = transformResponseToServerResponse(response);
                webResponse.headers.forEach((value, key) => {
                    set.headers[key] = value;
                });
                set.status = webResponse.status;

                resolve(undefined);
            });
        });
    });
}