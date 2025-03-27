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

	describe('Query Parameters Handling', () => {
		it.each([
			{
				scenario: 'multiple parameters',
				query: '?name=John&age=30&city=New%20York',
				expected: { name: 'John', age: '30', city: 'New York' }
			},
			{
				scenario: 'special characters',
				query: '?search=hello%20world&encoded=%24%25%5E',
				expected: { search: 'hello world', encoded: '$%^' }
			},
			{
				scenario: 'empty values',
				query: '?empty=&null=null',
				expected: { empty: '', null: 'null' }
			},
			{
				scenario: 'duplicate keys',
				query: '?color=red&color=blue',
				expected: { color: "blue" } // ['red', 'blue']
			},
			{
				scenario: 'no parameters',
				query: '',
				expected: {}
			}
		])('Should handle $scenario', async ({ query, expected }) => {
			const app = new Elysia().use(
				connect((req, res) => {
					res.end(JSON.stringify(req.query));
				})
			);

			const response = await app.handle(new Request(`http://localhost/${query}`));
			const result = await response.json();

			expect(response.status).toBe(200);
			expect(result).toEqual(expected);
		});

		it('Should handle different value types', async () => {
			const app = new Elysia().use(
				connect((req, res) => {
					res.end(JSON.stringify({
						number: Number(req.query.num),
						boolean: req.query.flag === 'true',
						array: typeof req.query?.ids === 'string' ? req.query?.ids?.split(',') : req.query?.ids
					}));
				})
			);

			const response = await app.handle(
				new Request('http://localhost/?num=42&flag=true&ids=1,2,3')
			);
			const result = await response.json();

			expect(result).toEqual({
				number: 42,
				boolean: true,
				array: ['1', '2', '3']
			});
		});
	});
});
