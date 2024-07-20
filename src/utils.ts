import type { ServerResponse } from "node:http";
import {
	type MockResponse,
	type RequestOptions,
	createRequest,
} from "node-mocks-http";

export function transformRequestToIncomingMessage(
	request: Request,
	options?: RequestOptions,
) {
	const parsedURL = new URL(request.url, "http://localhost");

	const query: Record<string, unknown> = {};
	for (const [key, value] of parsedURL.searchParams.entries()) {
		query[key] = value;
	}

	const message = createRequest({
		method: request.method.toUpperCase() as "GET",
		url: parsedURL.pathname,
		headers: request.headers.toJSON(),
		query,
		// body: request.body,
		...options,
	});

	return message;
}

export function transformResponseToServerResponse(
	serverResponse: MockResponse<ServerResponse>,
) {
	return new Response(serverResponse._getData(), {
		status: serverResponse.statusCode,
		statusText: serverResponse.statusMessage,
		// @ts-expect-error
		headers: serverResponse.getHeaders(),
	});
}
