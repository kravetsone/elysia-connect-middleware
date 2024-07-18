import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { Elysia } from "elysia";
import type { ConnectMiddleware } from "./types";
import { transformRequestToIncomingMessage } from "./utils";

export function connect(...middlewares: ConnectMiddleware[]) {
	return new Elysia({
		name: "connect",
	}).onRequest(async ({ request }) => {
		return await new Promise<Response | undefined>((resolve) => {
			console.log("SO");
			const message = transformRequestToIncomingMessage(request);

			const response = new ServerResponse(new IncomingMessage(new Socket()));

			response.end = (data: any) =>
				new Response(data, {
					status: response.statusCode,
					statusText: response.statusMessage,
					// @ts-expect-error
					headers: response.getHeaders(),
				});

			for (const middleware of middlewares) {
				middleware(message, response, () => {
					resolve(undefined);
				});
			}

			return resolve(
				new Response("SOO", {
					status: response.statusCode,
					statusText: response.statusMessage,
					// @ts-expect-error
					headers: response.getHeaders(),
				}),
			);
		});
	});
}
