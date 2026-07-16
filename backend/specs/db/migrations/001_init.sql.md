# db/migrations/001_init.sql

## Purpose

Initial database schema. Creates two tables: `tasks` (core entities) and `time_entries` (timer log).

## Schema

### Table: `tasks`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `INT UNSIGNED` | PRIMARY KEY, AUTO_INCREMENT | Auto-assigned on insert. |
| `title` | `VARCHAR(200)` | NOT NULL | Task name, max 200 characters. |
| `description` | `TEXT` | NULL | Optional longer description. |
| `done` | `TINYINT(1)` | NOT NULL, DEFAULT 0 | Boolean flag; `1` = completed, `0` = open. |
| `created_at` | `DATETIME` | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Set on insert. |
| `updated_at` | `DATETIME` | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | Set on insert and updated on every row modification. |

### Table: `time_entries`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `INT UNSIGNED` | PRIMARY KEY, AUTO_INCREMENT | Auto-assigned on insert. |
| `task_id` | `INT UNSIGNED` | NOT NULL | Foreign key to `tasks.id`. |
| `started_at` | `DATETIME` | NOT NULL | Timestamp when timer was started (set to `NOW()` on insert). |
| `stopped_at` | `DATETIME` | NULL | Timestamp when timer stopped. NULL = timer is still running. |
| `fk_time_entries_task` | — | FOREIGN KEY: `task_id` → `tasks.id`, ON DELETE CASCADE | Deleting a task deletes all its timer entries. |

## Behavior / business rules

- **Cascading deletes:** When a task is deleted, all its time entries are automatically deleted.
- **Timer semantics:** A timer is "running" if `stopped_at IS NULL`; a timer is "stopped" if `stopped_at IS NOT NULL`. There should be at most one running timer per task at any time (enforced by application logic, not database constraints).
- **Timestamps:** `updated_at` is automatically managed by MySQL and reflects the last time any field in the row changed.

## Notes

- `CREATE TABLE IF NOT EXISTS` prevents errors if the table already exists (idempotent).
- VARCHAR vs TEXT: `title` is VARCHAR for indexing efficiency; `description` is TEXT since it may be large and is not indexed.
- TINYINT(1) is a MySQL idiom for a boolean; values are 0 or 1.
- ON UPDATE CURRENT_TIMESTAMP for `updated_at` is MySQL-specific; PostgreSQL uses different syntax.
