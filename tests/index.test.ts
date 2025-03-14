import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { connect } from "../src";

describe("My own middleware", () => {
	it("Simple create header middleware", async () => {
		const HEADER_NAME = "elysia-middlewares";
		const EXPECTED_VALUE = "connect";

		const app = new Elysia().use(
			connect((req, res, next) => {
				res.setHeader(HEADER_NAME, EXPECTED_VALUE);
				next();
			}),
		);

		const response = await app.handle(new Request("http://localhost/"));

		expect(response.status).toBe(404);
		expect(response.headers.get(HEADER_NAME)).toBe(EXPECTED_VALUE);
	});

	it("Simple parse query-params", async () => {
		const EXPECTED_VALUE = "KRAVETSONE";

		const app = new Elysia().use(
			connect((req, res, next) => {
				res.end(req.query.value);
			}),
		);

		const response = await app.handle(
			new Request(`http://localhost/?value=${EXPECTED_VALUE}`),
		);

		expect(response.status).toBe(200);
		expect(await response.text()).toBe(EXPECTED_VALUE);
	});

	it("Simple parse body", async () => {
		const EXPECTED_VALUE = "KRAVETSONE";
		const app = new Elysia().use(
			connect((req, res, next) => {
				res.end(JSON.stringify(req.body));
			}),
		);
		const response = await app.handle(
			new Request("http://localhost/", {
				method: "POST",
				body: JSON.stringify({ value: EXPECTED_VALUE }),
				headers: {
					"Content-Type": "application/json"
				}
			}),
		);
		expect(response.status).toBe(200);

		let res = null;
		try {
			res = await response.json();
		} catch (err) {
			console.log('err', err);
		}

		expect(res).toEqual({ value: EXPECTED_VALUE });
	});

	it("Handle request with no body", async () => {
		const app = new Elysia().use(
			connect((req, res, next) => {
				res.end(JSON.stringify(req.body));
			}),
		);
		const response = await app.handle(
			new Request("http://localhost/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				}
			}),
		);
		expect(response.status).toBe(200);

		let res = {};
		try {
			res = await response.json();
		} catch (err) {
			console.log('err', err);
		}

		expect(res).toEqual({});
	});

	it("Calling request.json() multiple times", async () => {
		const EXPECTED_VALUE = { value: "KRAVETSONE" };

		const app = new Elysia()
			.onBeforeHandle(({ request }) => {
				const req1 = request.json();
				console.log(req1);
			})
			.use(
				connect(async (req, res, next) => {
					res.end(JSON.stringify(req.body));
				}).onBeforeHandle(({ request }) => {
					const req2 = request.json();
					console.log(req2);
				}).onAfterHandle(({ request }) => {
					const req3 = request.json();
					console.log(req3);
				}),
			)
			.onAfterHandle(({ request }) => {
				const req4 = request.json();
				console.log(req4);
			})

		const response = await app.handle(
			new Request("http://localhost/", {
				method: "POST",
				body: JSON.stringify(EXPECTED_VALUE),
				headers: {
					"Content-Type": "application/json"
				}
			}),
		);

		expect(response.status).toBe(200);

		let res = null;
		try {
			res = await response.json();
		} catch (err) {
			console.log('err', err);
		}

		expect(res).toEqual(EXPECTED_VALUE);
	});


});
