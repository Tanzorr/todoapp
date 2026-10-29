# middleware/not-found.js

## Purpose

Global 404 handler middleware. Catches requests that do not match any route and returns a structured 404 error response. Must be mounted before the error handler in `app.js`.

## Exports

- **`notFound(req, res, next)`** (middleware): Standard Express middleware function.
  - **Parameters:** `req` (request), `res` (response), `next` (unused but required).
  - **Returns:** No return value; always sends a JSON response with status `404`.

## Behavior / business rules

- **Response status:** Always `404 Not Found`.
- **Response body:**
  ```json
  {
    "error": {
      "status": 404,
      "message": "Route <METHOD> <URL> not found"
    }
  }
  ```
  For example, `GET /api/foobar` would return `"message": "Route GET /api/foobar not found"`.
- **Request info:** Uses `req.method` (HTTP verb) and `req.originalUrl` (full path including query string) to construct the message.
- **No error throwing:** Does not call `next(err)`; sends the response directly.

## Dependencies

- **Imports:** None
- **Depends on:** Mounted in `app.js` as the second-to-last middleware, before the error handler.

## Notes

- If a route handler explicitly returns `404` via `res.status(404).json(...)`, this middleware is not invoked.
- This middleware catches all remaining requests and returns a 404; placing it second-to-last (before the error handler) ensures all unmatched routes are caught.
