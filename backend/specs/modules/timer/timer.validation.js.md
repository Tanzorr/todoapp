# modules/timer/timer.validation.js

## Purpose

Input validation for timer endpoints. Validates task IDs passed in URL parameters.

## Exports

- **`validateTaskId(id)`** (function): Validates a numeric task ID.
  - **Parameters:** `id` (string or number): The value to validate.
  - **Returns:** Parsed integer ID if valid.
  - **Throws:** Error object with:
    - `status`: `400`
    - `message`: `"Invalid task id"`
    - No `field` property.

## Behavior / business rules

- **Parsing:** Converts the input to a base-10 integer.
- **Constraints:**
  - Must be a valid integer (not NaN, not a float).
  - Must be greater than 0 (positive).
- **On failure:** Throws immediately with a 400 error.

## Dependencies

- **Imports:** None
- **Depends on:** Called by `timer.controller.js` to validate the `:taskId` parameter.

## Notes

- The logic is identical to `tasks.validation.js`'s `validateId()`. A future refactor might extract this into a shared utility, but currently they are duplicated.
