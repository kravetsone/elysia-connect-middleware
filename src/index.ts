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

	// connectApp.use((err, req, res, next) => {
	// 	console.log(err)
	// })

	return new Elysia({
		name: "connect",
	}).onRequest(async ({ request, set }) => {
		// console.log(request)
		return await new Promise<Response | undefined>((resolve) => {
			const message = transformRequestToIncomingMessage(request);
			// @ts-expect-error
			message.app = connectApp;

			const response = createResponse();
			// console.log("SHOW", response)
			const end = response.end;

			// @ts-expect-error
			response.end = (...args: Parameters<typeof response.end>) => {
				const call = end.call(response, ...args);

				const webResponse = transformResponseToServerResponse(response);

				// if (response.writableEnded)
				resolve(webResponse);

				return call;
			};

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
