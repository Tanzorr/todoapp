# db/migrate.js

## Purpose

Reads SQL migration files from `db/migrations/` directory, sorts them by filename, executes each statement, and logs progress. Intended to be run once on setup via `npm run migrate`.

## Exports

None. This is an executable script.

## Behavior / business rules

- **Migration discovery:** Reads all `.sql` files from the `migrations/` directory and sorts them alphabetically. This ensures migrations run in a predictable order (e.g., `001_init.sql` before `002_add_column.sql`).
- **Statement splitting:** Each `.sql` file may contain multiple SQL statements separated by semicolons. The runner splits on `;`, trims whitespace, and executes each non-empty statement individually via `pool.execute()`.
- **Serial execution:** Migrations are executed one file at a time, one statement at a time (no parallelization).
- **Logging:** Prints one line per migration file (`[migrate] ✓ <filename>`) and a summary at the end (`[migrate] done`).
- **Error handling:** If any statement fails, logs the error and calls `process.exit(1)`.
- **Cleanup:** Calls `pool.end()` after all migrations complete to close the database connection.

## Dependencies

- **Imports:** `fs`, `path` (Node.js built-ins), `./pool`
- **Called by:** `npm run migrate` (as defined in `package.json`)

## Notes

- Migration files are **immutable** by convention; once run, they should not be edited. New changes go in a new migration file.
- The migration runner does NOT track which migrations have already been run (no `migrations` table). Every run executes all files in the directory. This is fine for small projects; larger projects typically add a `migrations` table and track executed filenames.
- Error messages include `[migrate]` prefix for parsing in logs.
- `pool.end()` closes the database connection, so this script must not be run while the server is running (they share no state, but both will close the connection).
