import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { Readable } from "node:stream";

export function transformRequestToIncomingMessage(request: Request) {
	const incomingMessage = new IncomingMessage(new Socket());
	incomingMessage.method = request.method;
	incomingMessage.headers = request.headers.toJSON();
	incomingMessage.url = sanitizeUrl(request.url);

	if (request.body) {
		const readable = Readable.fromWeb(request.body);
		incomingMessage.push(readable);
	}

	return incomingMessage;
}

function sanitizeUrl(url) {
	/* eslint-disable-next-line no-var */
	for (var i = 0, len = url.length; i < len; i++) {
		const charCode = url.charCodeAt(i);
		if (charCode === 63 || charCode === 35) {
			return url.slice(0, i);
		}
	}
	return url;
}
