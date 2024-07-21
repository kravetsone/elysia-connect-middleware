import type { Request, Response } from "express";
import type { MockRequest, MockResponse } from "node-mocks-http";

export type ConnectMiddleware = (
	req: MockRequest<Request>,
	res: MockResponse<Response>,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	next: (err?: any) => unknown,
) => unknown;
