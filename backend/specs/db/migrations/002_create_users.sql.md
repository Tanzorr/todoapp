# db/migrations/002_create_users.sql

## Purpose

Creates `users` — one row per `User` who can sign in (ADR-016). Undone by `002_create_users.down.sql` (`DROP TABLE IF EXISTS users`).

## Schema

### Table: `users`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `INT UNSIGNED` | PRIMARY KEY, AUTO_INCREMENT | |
| `email` | `VARCHAR(254)` | NOT NULL, UNIQUE `uq_users_email` | Stored trimmed and lowercased by the application. |
| `password_hash` | `VARCHAR(255)` | NOT NULL | bcrypt hash. Never leaves `users.repository.js` except to the sign-in check (I-12). |
| `created_at` | `DATETIME` | NOT NULL, DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | `DATETIME` | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE | |

## Notes

- 254 is the longest valid email address.
- Case-insensitive uniqueness comes from the application lowercasing `email`, not from the column collation.
- Must run before `003` and `004`, whose foreign keys point here.
