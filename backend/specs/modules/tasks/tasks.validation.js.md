# modules/tasks/tasks.validation.js

## Purpose

Input validation functions for task fields. Ensures data conforms to constraints before being inserted or updated in the database.

## Exports

- **`validateTitle(title)`** (function): Validates a task title.
  - **Parameters:** `title` (any type): The value to validate.
  - **Returns:** No return value (validates in-place).
  - **Throws:** Error object with:
    - `status`: `400`
    - `message`: Either `"Title is required"` or `"Title must be 200 characters or fewer"` (depending on which constraint is violated).
    - `field`: `"title"`

- **`validateId(id)`** (function): Validates a numeric ID (for task or any resource).
  - **Parameters:** `id` (string or number): The value to validate.
  - **Returns:** Parsed integer ID if valid.
  - **Throws:** Error object with:
    - `status`: `400`
    - `message`: `"Invalid task id"`
    - No `field` property.

## Behavior / business rules

- **Title validation:**
  - Must be a non-empty string (after trimming whitespace).
  - Must not exceed 200 characters (after trimming).
  - Type must be `"string"`.
  - If any constraint is violated, throws immediately.

- **ID validation:**
  - Parses the input as a base-10 integer.
  - Must be a valid integer (not NaN, not a float).
  - Must be greater than 0 (positive).
  - Returns the parsed integer.

## Dependencies

- **Imports:** None
- **Depends on:** Called by `tasks.controller.js` and `tasks.service.js`

## Notes

- `validateTitle` is called in both the controller (before passing to service) and the service (for redundancy/safety).
- `MAX_TITLE_LENGTH = 200` is a file-level constant; changing it requires editing this file.
- Errors thrown are designed to be caught by the express error handler and converted to HTTP 400 responses.
