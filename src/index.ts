import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import Connect from "connect";
import { Elysia } from "elysia";
import { createResponse } from "node-mocks-http";
import type { ConnectMiddleware } from "./types";
import {
	transformRequestToIncomingMessage,
	transformResponseToServerResponse,
} from "./utils";

const connectApp = Connect();

export function connect(...middlewares: ConnectMiddleware[]) {
	for (const middleware of middlewares) {
		connectApp.use(middleware);
	}

	// connectApp.use((err, req, res, next) => {
	// 	console.log(err)
	// })

	return new Elysia({
		name: "connect",
	}).onRequest(async ({ request, set }) => {
		return await new Promise<Response | undefined>((resolve) => {
			const message = transformRequestToIncomingMessage(request);

			const response = createResponse();

			const end = response.end;

			// @ts-expect-error
			response.end = (...args: Parameters<typeof response.end>) => {
				const call = end.call(response, ...args);

				console.log(response);

				const webResponse = transformResponseToServerResponse(response);

				// if (response.writableEnded)
				resolve(webResponse);

				return call;
			};

			connectApp.handle(message, response, () => {
				const webResponse = transformResponseToServerResponse(response);
				webResponse.headers.forEach((value, key) => {
					console.log(key, value);
					set.headers[key] = value;
				});
				set.status = webResponse.status;

				resolve(undefined);
			});
		});
	});
}
