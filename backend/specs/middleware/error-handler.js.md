# middleware/error-handler.js

## Purpose

Global error handler. Turns anything thrown or passed to `next(err)` into an `ApiError` response (I-7). Must be the last middleware mounted.

## Exports

- **`errorHandler(err, req, res, next)`** (middleware): Express 4-argument error handler. Always sends JSON.

## Behavior / business rules

- **Status:** `err.status` when it is a known HTTP status from 400 to 599; otherwise `500`.
- **Body:**
  ```json
  { "error": { "status": 404, "code": "NOT_FOUND", "message": "Task not found", "field": "title" } }
  ```
  - `code` — the status's standard name in `UPPER_SNAKE_CASE` (`BAD_REQUEST`, `UNAUTHORIZED`, `NOT_FOUND`, `CONFLICT`, `TOO_MANY_REQUESTS`, `INTERNAL_SERVER_ERROR`, …). Added by TASK-025 (D3); additive under ADR-007.
  - `message` — `err.message` for 4xx; always `Internal Server Error` for 5xx, so SQL or library messages never reach the client.
  - `field` — only when `err.field` is set (validation errors).
- **Logging:** 5xx errors are written to stderr with `console.error`; 4xx are not logged.
- **No stack traces** in responses.

## Dependencies

- **Imports:** `http` (`STATUS_CODES`)
- **Called by:** mounted last in `app.js`; `not-found.js` and `rate-limit.js` route their errors here.

## Notes

- The unused `next` parameter is what makes Express treat this as an error handler.
- Body-parser errors (malformed JSON) carry `status: 400` and keep their message.
