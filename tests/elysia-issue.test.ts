import { Elysia } from "elysia";
import { describe, it, expect } from "bun:test";

describe("Elysia issue", () => {
	it("should be a test", async () => {
		const elysia = new Elysia().onRequest(({ set }) => {
			set.headers["x-test"] = "test";
            // .get("/", "Hello World"); broken
		}).get("/", () => "Hello World");


		const response = await elysia.handle(new Request("http://localhost/"));
        console.log(response)
		expect(response.status).toBe(200);
	});
});
