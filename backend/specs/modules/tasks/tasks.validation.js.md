# modules/tasks/tasks.validation.js

## Purpose

`zod` schemas for a Task title and a Task id, run through `lib/validate.js` (D7 of TASK-025). Messages are the same as before zod.

## Exports

- **`validateTitle(title)`**: Returns the trimmed title.
  - **Throws:** `400`, `field: 'title'`, message `Title is required` (not a string, or empty after trim) or `Title must be 200 characters or fewer` (over 200 after trim).
- **`validateId(id)`**: Returns the id as an integer.
  - **Throws:** `400` `Invalid task id`, no `field`.

## Behavior / business rules

- **Title:** 1–200 characters after trim (I-6).
- **Id:** parsed with `parseInt(id, 10)` first, then must be a positive integer. So `'12abc'` is accepted as `12`, as before zod; `'abc'`, `'0'` and `'-3'` are refused.

## Dependencies

- **Imports:** `zod`, `../../lib/validate`
- **Called by:** `tasks.controller.js` (`validateId`), `tasks.service.js` (`validateTitle`)

## Notes

- `timer.validation.js` holds the same id rule for `:taskId`.
