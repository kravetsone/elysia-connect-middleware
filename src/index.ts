import Connect from "connect";
import { Elysia } from "elysia";
import type { ConnectMiddleware } from "./types";
import {
	transformRequestToIncomingMessage,
	transformResponseToServerResponse,
	createResponse
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
		const message = await transformRequestToIncomingMessage(connectApp, request);

		return await new Promise<Response | undefined>((resolve) => {
			

			const response = createResponse(message, resolve);

			connectApp.handle(message, response, () => {
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