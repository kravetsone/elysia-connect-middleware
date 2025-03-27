# elysia-connect-middleware

<div>

[![npm](https://img.shields.io/npm/v/elysia-connect-middleware?logo=npm&style=flat&labelColor=000&color=3b82f6)](https://www.npmjs.org/package/elysia-connect-middleware)

<!-- [![JSR](https://jsr.io/badges/@kravets/t-kassa-api)](https://jsr.io/@kravets/t-kassa-api)
[![JSR Score](https://jsr.io/badges/@kravets/t-kassa-api/score)](https://jsr.io/@kravets/t-kassa-api) -->

</div>

This plugin allows you to use [`express`](https://www.npmjs.com/package/express)/[`connect`](https://www.npmjs.com/package/connect) middleware directly in Elysia!

```ts
import { Elysia } from "elysia";
import { connect } from "elysia-connect-middleware";

const app = new Elysia()
    .use(
        connect(require("cors")(), (req, res, next) => {
            res.setHeader("Powered-By", "elysia-connect-middleware");

            next();
        })
    )
    .get("/", "Hello, elysia-connect-middleware!");
```

#### Installation

```bash
bun install elysia-connect-middleware
```

### Tested middlewares

-   [`passport`](https://www.passportjs.org/)
-   [`vite#createServer`](https://vitejs.dev/guide/api-javascript.html)
-   [`express-static`](https://www.npmjs.com/package/express-static)
-   [`cors`](https://www.npmjs.com/package/cors)
-   [`helmet`](https://www.npmjs.com/package/helmet)
-   [`express-rate-limit`](https://www.npmjs.com/package/express-rate-limit)

### TODO:

<!-- -   Think more about body-parsing (Maybe use `app.event.parse` and ship already parsed body without `body-parser` or call `request.clone().bytes()`). This is not supported at the moment -->

-   Find more libraries for testing
-   Clean up dependencies

### Thanks

-   [`node-mocks-http`](https://www.npmjs.com/package/node-mocks-http) - the objects of this library are used for middleware `request`/`response`
