import type { IncomingMessage, ServerResponse } from "node:http";

export type ConnectMiddleware = (
	req: IncomingMessage,
	res: ServerResponse,
	next: (err?: any) => unknown,
) => unknown;
