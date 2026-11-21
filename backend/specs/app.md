# app.js

## Purpose

Configures and exports the Express application instance. Sets up middleware (CORS, JSON body parsing), mounts routes, and attaches global error/404 handlers.

## Exports

- **`app`** (Express app object): The configured application, ready to be mounted or listened on.

## Behavior / business rules

- **CORS:** In development (`NODE_ENV === 'development'`), a request whose `Origin` is `http://localhost[:port]` or `http://127.0.0.1[:port]` gets that exact origin back in `Access-Control-Allow-Origin` with `Access-Control-Allow-Credentials: true`, so the pages on `:8080` can send the refresh cookie (ADR-019). Any other origin gets no allow-origin header. Every response carries `Vary: Origin`; allowed methods GET, POST, PUT, PATCH, DELETE; allowed headers `Content-Type`, `Authorization`. Responds to preflight (`OPTIONS`) with `204 No Content`. In production, no CORS middleware is installed.
- **Body parsing:** All requests are parsed as JSON via `express.json()`.
- **Health endpoint (`GET /health`):** Returns `{ status: 'ok', timestamp: '<ISO8601>' }` with `200 OK`. Useful for load balancers and monitoring.
- **API routes:** Auth API at `/api/auth` (register, login, refresh, logout, me); Tasks API at `/api/tasks` (includes nested timer routes) and Users API at `/api/users`, both behind `authenticate`, so every Task, Timer and Users route answers `401` without a valid access token.
- **Error handling order:** Global 404 handler comes before the error handler. The error handler is Express's standard 4-argument signature `(err, req, res, next)` to catch `throw` and `next(err)` from route handlers.

## Dependencies

- **Imports:** `express`, `./middleware/not-found`, `./middleware/error-handler`, `./middleware/authenticate`, `./config/env`, `./modules/auth/auth.routes`, `./modules/tasks/tasks.routes`, `./modules/users/users.routes`
- **Depends on:** `server.js` (which requires and listens on it)

## Notes

- `NODE_ENV` defaults to `'development'` if not set; CORS is only auto-enabled for development.
- CORS `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers` are hardcoded; extending them requires editing this file.
