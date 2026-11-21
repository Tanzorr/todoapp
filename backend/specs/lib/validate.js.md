# lib/validate.js

## Purpose

Runs a `zod` schema and turns the first failure into the backend's `400` error, so every validator — auth, task title, ids — reports the same way (D7 of TASK-025).

## Exports

- **`validate(schema, value, field?)`**: Parses `value` with `schema`.
  - **Parameters:** `schema` (zod schema); `value` (anything); `field` (string, optional) — the field to report when the failing issue has no path, i.e. for a schema on a single value.
  - **Returns:** the parsed value — with the schema's transforms applied (e.g. trimmed, lowercased).
  - **Throws:** `Error` with `status = 400`, `message` = the first issue's message, and `field` = the first segment of the issue's path, else the `field` argument, else none.

## Behavior / business rules

- Only the first issue is reported; the client fixes one field at a time.
- The message is whatever the schema declared. Schemas in this backend always declare their own, so zod's default wording reaches the client only for an input of the wrong top-level type.

## Dependencies

- **Imports:** none (receives the schema).
- **Called by:** `auth.validation.js`, `tasks.validation.js`, `timer.validation.js`, `users.validation.js`.
