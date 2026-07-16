# app.js

## Purpose

Configures and exports the Express application instance. Sets up middleware (CORS, JSON body parsing), mounts routes, and attaches global error/404 handlers.

## Exports

- **`app`** (Express app object): The configured application, ready to be mounted or listened on.

## Behavior / business rules

- **CORS:** In development (`NODE_ENV === 'development'`), allows all origins for GET, POST, PUT, DELETE with `Content-Type` header. Responds to preflight (`OPTIONS`) with `204 No Content`. In production, no CORS middleware is installed.
- **Body parsing:** All requests are parsed as JSON via `express.json()`.
- **Health endpoint (`GET /health`):** Returns `{ status: 'ok', timestamp: '<ISO8601>' }` with `200 OK`. Useful for load balancers and monitoring.
- **API routes:** Tasks API is mounted at `/api/tasks` (includes nested timer routes).
- **Error handling order:** Global 404 handler comes before the error handler. The error handler is Express's standard 4-argument signature `(err, req, res, next)` to catch `throw` and `next(err)` from route handlers.

## Dependencies

- **Imports:** `express`, `./middleware/not-found`, `./middleware/error-handler`, `./config/env`, `./modules/tasks/tasks.routes`
- **Depends on:** `server.js` (which requires and listens on it)

## Notes

- `NODE_ENV` defaults to `'development'` if not set; CORS is only auto-enabled for development.
- CORS `Access-Control-Allow-Methods` and `Access-Control-Allow-Headers` are hardcoded; extending them requires editing this file.
