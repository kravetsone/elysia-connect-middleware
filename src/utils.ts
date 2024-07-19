import { IncomingMessage, type ServerResponse } from "node:http";
import { Socket } from "node:net";
import { Readable } from "node:stream";
import {
	type MockResponse,
	type RequestOptions,
	createRequest,
} from "node-mocks-http";

// const incomingMessage = new IncomingMessage(new Socket());
// incomingMessage.method = request.method;
// incomingMessage.headers = request.headers.toJSON();
// incomingMessage.url = request.url;
// if (request.body) {
// 	const readable = Readable.fromWeb(request.body);
// 	incomingMessage.push(readable);
// }
// return incomingMessage;

export function transformRequestToIncomingMessage(
	request: Request,
	options?: RequestOptions,
) {
	const parsedURL = new URL(request.url, "http://localhost");
	const message = createRequest({
		method: request.method.toUpperCase() as "GET",
		url: parsedURL.pathname,
		headers: request.headers.toJSON(),
		...options,
	});
	console.log(message.url, parsedURL);
	return message;
}

export function transformResponseToServerResponse(
	serverResponse: MockResponse<ServerResponse>,
) {
	console.log(serverResponse, serverResponse._getData());

	return new Response(serverResponse._getData(), {
		status: serverResponse.statusCode,
		statusText: serverResponse.statusMessage,
		// @ts-expect-error
		headers: serverResponse.getHeaders(),
	});
}
