# db/migrate.js

## Purpose

Applies pending SQL migrations from `db/migrations/` and records each in `schema_migrations`, or undoes the last one. Run as `npm run migrate` / `npm run migrate:down`; the test harness calls `up()` directly (ADR-017).

## Exports

- **`up()`** (async): Applies every `NNN_<what>.sql` not yet in `schema_migrations`, in filename order, recording each after it runs.
  - **Returns:** Promise resolving to the array of filenames applied (empty when none were pending).
  - **Throws:** The first SQL error; files after it are not run.

- **`down()`** (async): Runs `NNN_<what>.down.sql` for the most recently applied migration and removes its row.
  - **Returns:** Promise resolving to the undone filename, or `null` when nothing is applied.
  - **Throws:** `Error` when the matching `.down.sql` file does not exist; any SQL error.

## Behavior / business rules

- **Discovery:** only files matching `^\d{3}_[\w-]+\.sql$` are migrations; `.down.sql` files never match.
- **Tracking:** `schema_migrations (name PK, applied_at)` is created on first use. A database migrated before this runner existed re-runs `001_init.sql`, which is idempotent, and records it.
- **Statement splitting:** each file is split on `;` and each non-empty statement runs through `pool.query()` (text protocol, so DDL is accepted). A `;` inside a string or comment would break the split.
- **Down guard (CLI only):** `migrate.js down` refuses unless `DB_NAME` ends in `_test` or `--force` is passed (`npm run migrate:down -- --force`).
- **CLI:** logs `[migrate] ✓ <file>` per applied file and `[migrate] ↶ <file>` per undone one; on error logs `[migrate] error: <message>` and exits `1`. Always closes the pool.

## Dependencies

- **Imports:** `fs`, `path`, `./pool`, `../config/env` (`DB_NAME`)
- **Called by:** `npm run migrate`, `npm run migrate:down`, `backend/test/helpers.js`

## Notes

- Applied migrations are immutable; a change is a new numbered file with its own `.down.sql`.
- MySQL commits DDL immediately: a file that fails halfway leaves its earlier statements applied and is not recorded. Fix forward, or undo by hand.
- `up()`/`down()` do not close the pool; the caller does.
