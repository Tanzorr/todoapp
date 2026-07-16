# db/pool.js

## Purpose

Creates and exports a MySQL connection pool using `mysql2/promise`. The pool is a shared resource for all database queries and handles connection recycling and limits.

## Exports

- **`pool`** (mysql2/promise.Pool): The connection pool object. Can be directly used to execute queries via `.execute()` or ended via `.end()`.
- **`query(sql, params)`** (async function): Helper function that executes a parameterized SQL query.
  - **Parameters:**
    - `sql` (string): SQL statement with `?` placeholders for parameterized queries.
    - `params` (array): Values to bind to the `?` placeholders.
  - **Returns:** Promise resolving to rows (array of result objects). Throws if the query fails.
  - **Errors:** MySQL errors are propagated as exceptions (connection errors, SQL syntax errors, constraint violations, etc.).

## Behavior / business rules

- **Connection pool settings:**
  - `waitForConnections: true` — queues requests if no connections are available.
  - `connectionLimit: 10` — maximum 10 concurrent connections.
  - `queueLimit: 0` — unlimited queue (no timeout/rejection).
- **Parameterized queries:** Always use `?` placeholders with `params` to prevent SQL injection.
- **Return format:** For `SELECT` queries, returns the rows array. For `INSERT`, returns a result object with `insertId` property. For `UPDATE`/`DELETE`, returns an empty array (check `.affectedRows` in the result if needed, but currently not exported by the helper).

## Dependencies

- **Imports:** `mysql2/promise`, `./config/env` (for database credentials)
- **Depends on:** All repository modules (`tasks.repository`, `timer.repository`) and the migration runner (`migrate.js`)

## Notes

- Uses `mysql2/promise` which returns Promises instead of callbacks.
- The pool is created at module load time and persists for the application lifetime.
- `pool.end()` is called by the migration runner to cleanly shut down after migrations complete; it is not called elsewhere.
- If the database is unavailable at startup, the pool creation itself does not fail — connection errors occur on the first query attempt.
