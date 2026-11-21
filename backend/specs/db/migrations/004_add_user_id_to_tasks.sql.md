# db/migrations/004_add_user_id_to_tasks.sql

## Purpose

Gives every Task an owning User (I-11, ADR-018). Existing Tasks go to a seed User nobody can sign in as (D4 of TASK-025).

## Schema change

### Table: `tasks`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `user_id` | `INT UNSIGNED` | NOT NULL, FK `fk_tasks_user` → `users.id` ON DELETE CASCADE | After `id`. Indexed by the FK. |

### Seed row in `users`

| `email` | `password_hash` | Why |
| :--- | :--- | :--- |
| `legacy@todo.invalid` | `!no-password` | Owns the Tasks that existed before accounts. Not a bcrypt hash, so `bcrypt.compare` is always false and nobody can sign in as it. `.invalid` is a reserved TLD. |

## Behavior / business rules

Statements, in order:

1. `INSERT IGNORE` the seed User.
2. Add `user_id` as NULL-able.
3. Set every NULL `user_id` to the seed User's id.
4. Make it NOT NULL and add the foreign key.

Deleting a User deletes its Tasks, and through `fk_time_entries_task` their TimeEntries.

## Down (`004_add_user_id_to_tasks.down.sql`)

Drops the foreign key and the column, then deletes the seed User. Every User's Tasks become one shared list again; no Task or TimeEntry is lost.

## Notes

- To move the legacy Tasks to a real account: see `backend/README.md` → *Existing Tasks*.
- MySQL 8 has no `ADD COLUMN IF NOT EXISTS`; this file relies on running once (ADR-017).
