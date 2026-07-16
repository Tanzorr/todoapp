# middleware/error-handler.js

## Purpose

Global error handler middleware. Catches errors thrown or passed via `next(err)` from route handlers and responds with a JSON error object. Must be the last middleware mounted in the app.

## Exports

- **`errorHandler(err, req, res, next)`** (middleware): Express 4-argument error handler.
  - **Parameters:**
    - `err` (Error object): The error to handle.
    - `req`, `res`, `next`: Standard Express request/response/next.
  - **Returns:** No return value; always sends a JSON response.

## Behavior / business rules

- **Status code:** Uses `err.status` if present, otherwise defaults to `500` (Internal Server Error).
- **Message:** Uses `err.message` if present, otherwise defaults to `'Internal Server Error'`.
- **Response body:** Always returns a JSON object with structure:
  ```json
  {
    "error": {
      "status": <number>,
      "message": "<string>",
      "field": "<string>"  // only if err.field is set
    }
  }
  ```
- **Field errors:** If the error object has an `err.field` property (used for validation errors), it is included in the response. This helps the client know which input field caused the error.
- **No stack traces:** Stack traces are not sent to the client, even in development. Logs go to stderr/stdout only.

## Dependencies

- **Imports:** None (pure middleware)
- **Depends on:** Mounted in `app.js` as the last middleware. All route handlers should throw or call `next(err)` to route to this handler.

## Notes

- The `next` parameter is unused but required by Express to identify this as a 4-argument error handler.
- Errors from synchronous code (e.g., `validateId()` throwing) are caught by Express's default behavior and routed here. Errors from async route handlers must be caught and passed to `next(err)` in a try-catch.
- This handler does not log; consider adding logging middleware before deploying to production.
