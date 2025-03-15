import type { ServerResponse } from "node:http";
import {
	type MockResponse,
	type RequestOptions,
	type Body as MockBody,
	createRequest,
	type MockRequest,
} from "node-mocks-http";

function mockAppAtRequest(message: MockRequest<any>, connectApp: any) {
	message.app = connectApp;

	message.app.get = (data: string) => {
		console.log(data);
		return false;
	};

	return message;
}

export async function transformRequestToIncomingMessage(
	connectApp: any,
	request: Request,
	options?: RequestOptions,
) {
	const parsedURL = new URL(request.url, "http://localhost");

	const query: Record<string, unknown> = {};
	for (const [key, value] of parsedURL.searchParams.entries()) {
		query[key] = value;
	}

	let body: MockBody | Body | undefined;

	try {
		body = (await request.clone().json()) as MockBody;
	} catch {
		body = undefined;
	}

	const message = createRequest({
		method: request.method.toUpperCase() as "GET",
		url: parsedURL.pathname,
		headers: request.headers.toJSON(),
		query,
		body,
		...options,
	});

	return mockAppAtRequest(message, connectApp);
}

export function transformResponseToServerResponse(
	serverResponse: MockResponse<ServerResponse>,
) {
	// console.log("content", serverResponse._getData(), serverResponse._getBuffer());

	return new Response(
		serverResponse._getData() || serverResponse._getBuffer(),
		{
			status: serverResponse.statusCode,
			statusText: serverResponse.statusMessage,
			// @ts-expect-error
			headers: serverResponse.getHeaders(),
		},
	);
}
