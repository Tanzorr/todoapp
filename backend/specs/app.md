# app.js

## Purpose

Configures and exports the Express application instance. Sets up middleware (CORS, JSON body parsing), mounts routes, and attaches global error/404 handlers.

## Exports

- **`app`** (Express app object): The configured application, ready to be mounted or listened on.

## Behavior / business rules

- **CORS:** In development (`NODE_ENV === 'development'`), allows all origins for GET, POST, PUT, DELETE with `Content-Type` and `Authorization` headers. Credentials (the refresh cookie) are not allowed cross-origin yet — the frontend sign-in ticket decides that. Responds to preflight (`OPTIONS`) with `204 No Content`. In production, no CORS middleware is installed.
- **Body parsing:** All requests are parsed as JSON via `express.json()`.
- **Health endpoint (`GET /health`):** Returns `{ status: 'ok', timestamp: '<ISO8601>' }` with `200 OK`. Useful for load balancers and monitoring.
- **API routes:** Auth API at `/api/auth` (register, login, refresh, logout, me); Tasks API at `/api/tasks` (includes nested timer routes) behind `authenticate`, so every Task and Timer route answers `401` without a valid access token.
- **Error handling order:** Global 404 handler comes before the error handler. The error handler is Express's standard 4-argument signature `(err, req, res, next)` to catch `throw` and `next(err)` from route handlers.

## Dependencies

- **Imports:** `express`, `./middleware/not-found`, `./middleware/error-handler`, `./middleware/authenticate`, `./config/env`, `./modules/auth/auth.routes`, `./modules/tasks/tasks.routes`
- **Depends on:** `server.js` (which requires and listens on it)

## Notes

- `NODE_ENV` defaults to `'development'` if not set; CORS is only auto-enabled for development.
- CORS `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers` are hardcoded; extending them requires editing this file.
