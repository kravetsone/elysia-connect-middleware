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
			.get("/", () => "Hello, world!");

		const response = await app.handle(new Request("http://localhost/"));

		expect(response.status).toBe(200);
		expect(response.headers.get("x-ratelimit-remaining")).toBe("0");

		const response2 = await app.handle(new Request("http://localhost/"));

		expect(response2.status).toBe(429);
		expect(response2.headers.get("retry-after")).toBe("60");
	});

	// TODO: Fix this test
	it.todo("Use processImage() from express-processimage middleware", async () => {
		const ROOT = join(import.meta.dirname, "assets");

		const app = new Elysia().use(
			connect(
				(await import("express-processimage")).default({
					root: ROOT,
				}),
				require("express-static")(ROOT),
			),
		);

		const response = await app.handle(
			new Request(
				"http://localhost/takodachi.png?resize=1,1&pngquant=128pngcrush=-rem+alla&setFormat=jpg",
			),
		);

		console.log(response);
		// console.log(await response.text());
		// Bun.write("response.png", await response.arrayBuffer());

		expect(response.status).toBe(200);
		
	});

	it("Use createServer from vite middleware", async () => {
		const vite = await (await import("vite")).createServer({
			root: join(import.meta.dirname, "assets"),
			server: {
				middlewareMode: true,
				allowedHosts: true
			},
		});

		const app = new Elysia().use(connect(vite.middlewares));

		const response = await app.handle(new Request("http://localhost/"));

		console.log(response)

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toBe("text/html");
		// expect(Number(response.headers.get("content-length"))).not.toBe(0);
		expect(await response.text()).toContain("@vite");
	});

	it("Use passport middleware with basic strategy", async () => {
		const passport = require("passport");
		const { BasicStrategy } = require("passport-http");
		
		passport.use(new BasicStrategy((username: string, password: string, done: any) => {
			if (username === "admin" && password === "secret") {
				return done(null, { username });
			}
			return done(null, false);
		}));

		const app = new Elysia()
			.use(connect(passport.initialize(), passport.authenticate("basic", { session: false })))
			.get("/", () => "Authorized");

		const unauthorizedResponse = await app.handle(new Request("http://localhost/"));
		expect(unauthorizedResponse.status).toBe(401);
		expect(unauthorizedResponse.headers.get("www-authenticate")).toBe('Basic realm="Users"');

		const authHeader = "Basic " + Buffer.from("admin:secret").toString("base64");
		const authorizedResponse = await app.handle(new Request("http://localhost/", {
			headers: { "Authorization": authHeader }
		}));
		expect(authorizedResponse.status).toBe(200);

		const invalidAuthHeader = "Basic " + Buffer.from("user:wrong").toString("base64");
		const invalidResponse = await app.handle(new Request("http://localhost/", {
			headers: { "Authorization": invalidAuthHeader }
		}));
		expect(invalidResponse.status).toBe(401);
	});

});
