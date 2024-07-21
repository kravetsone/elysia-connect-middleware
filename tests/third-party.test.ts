import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { Elysia } from "elysia";
import { connect } from "../src";

describe("Connect middleware", () => {
	it("Use cors() middleware", async () => {
		const app = new Elysia().use(
			connect(
				require("cors")({
					origin: "http://example.com",
				}),
			),
		);

		const response = await app.handle(new Request("http://localhost/"));

		expect(response.status).toBe(404);
		expect(response.headers.get("access-control-allow-origin")).toBe(
			"http://example.com",
		);
		expect(response.headers.get("vary")).toBe("Origin");
	});
	it("Use static() from express-static middleware", async () => {
		const app = new Elysia().use(connect(require("express-static")(".")));

		const response = await app.handle(
			new Request("http://localhost/README.md"),
		);

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toContain("markdown");
		expect(response.headers.get("content-length")).not.toBe(0);
	});
	it("Use helmet() middleware", async () => {
		const app = new Elysia().use(connect(require("helmet")()));

		const response = await app.handle(new Request("http://localhost/"));

		expect(response.status).toBe(404);
		expect(response.headers.get("content-security-policy")).toBeString();
	});
	it("Use rateLimit() from express-rate-limit middleware", async () => {
		const app = new Elysia()
			.use(
				connect(
					(await import("express-rate-limit")).rateLimit({
						limit: 1,
					}),
				),
			)
			.get("/", "Hello, world!");

		const response = await app.handle(new Request("http://localhost/"));

		expect(response.status).toBe(200);
		expect(response.headers.get("x-ratelimit-remaining")).toBe("0");

		const response2 = await app.handle(new Request("http://localhost/"));

		expect(response2.status).toBe(429);
		expect(response2.headers.get("retry-after")).toBe("60");
	});

	// it("Use processImage() from express-processimage middleware", async () => {
	// 	const ROOT = "./tests/assets";

	// 	const app = new Elysia().use(
	// 		connect(
	// 			(await import("express-processimage")).default({
	// 				root: ROOT,
	// 			}),
	// 			require("express-static")(ROOT),
	// 		),
	// 	);

	// 	const response = await app.handle(
	// 		new Request(
	// 			"http://localhost/takodachi.png?resize=400,300&pngquant=128&pngcrush&setFormat=jpg",
	// 		),
	// 	);

	// 	console.log(response);

	// 	expect(response.status).toBe(200);
	// 	// expect(response.headers.get("content-security-policy")).toBeString();
	// });

	it("Use createServer from vite middleware", async () => {
		const vite = await (await import("vite")).createServer({
			root: join(import.meta.dirname, "assets"),
			server: {
				middlewareMode: true,
			},
		});

		const app = new Elysia().use(connect(vite.middlewares));

		const response = await app.handle(new Request("http://localhost/"));

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toBe("text/html");
		expect(response.headers.get("content-length")).not.toBe(0);
		expect(await response.text()).toContain("@vite");
	});
});
