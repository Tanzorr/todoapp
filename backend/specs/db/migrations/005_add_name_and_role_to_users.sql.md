# db/migrations/005_add_name_and_role_to_users.sql

## Purpose

Adds a display name and a role to `users` (TASK-027, ADR-020).

## Schema change

### Table: `users`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `name` | `VARCHAR(80)` | NULL | After `email`. NULL = no name; the API answers `''`. |
| `role` | `ENUM('user', 'admin')` | NOT NULL, DEFAULT `'user'` | After `password_hash`. Every existing User becomes `user`. |

## Down (`005_add_name_and_role_to_users.down.sql`)

Drops both columns. Names and the admin role are lost; Users, Tasks and tokens stay.

## Notes

- Make the first admin with `UPDATE users SET role = 'admin' WHERE email = '…';` — see `backend/README.md`.
