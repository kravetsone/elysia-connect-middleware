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
				console.log(req.body);
				res.end(req.body);
			}),
		);
		const response = await app.handle(
			new Request("http://localhost/", {
				body: JSON.stringify({ value: "KRAVETSONE" }),
			}),
		);
		expect(response.status).toBe(200);
		expect(await response.json()).toBe(EXPECTED_VALUE);
	});
});
