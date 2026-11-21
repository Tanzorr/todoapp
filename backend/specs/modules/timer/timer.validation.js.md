# modules/timer/timer.validation.js

## Purpose

Validates the `:taskId` URL parameter of the timer routes with a `zod` schema, run through `lib/validate.js`.

## Exports

- **`validateTaskId(id)`**: Returns the id as an integer.
  - **Throws:** `400` `Invalid task id`, no `field`.

## Behavior / business rules

- Parsed with `parseInt(id, 10)` first, then must be a positive integer — `'12abc'` is accepted as `12`; `'abc'`, `'0'` and `'-3'` are refused.

## Dependencies

- **Imports:** `zod`, `../../lib/validate`
- **Called by:** `timer.controller.js`

## Notes

- The same rule as `tasks.validation.js`'s `validateId()`, kept in each module.
