# middleware/not-found.js

## Purpose

Catch-all for requests no route matched. Mounted after all routes, before `errorHandler`.

## Exports

- **`notFound(req, res, next)`** (middleware): Calls `next(err)` with `err.status = 404` and `err.message = 'Route <METHOD> <originalUrl> not found'`.

## Behavior / business rules

- It does not write the response itself; `errorHandler` does, so a `404` has the same `ApiError` shape (with `code: "NOT_FOUND"`) as every other error.

## Dependencies

- **Imports:** none
- **Called by:** mounted in `app.js` after the routes.
