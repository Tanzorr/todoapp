# db/migrations/003_create_refresh_tokens.sql

## Purpose

Creates `refresh_tokens` — one row per issued `RefreshToken`, so sign-out and rotation can end a session on the server (ADR-016, I-13). Undone by `003_create_refresh_tokens.down.sql` (`DROP TABLE IF EXISTS refresh_tokens`).

## Schema

### Table: `refresh_tokens`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `INT UNSIGNED` | PRIMARY KEY, AUTO_INCREMENT | |
| `user_id` | `INT UNSIGNED` | NOT NULL, FK `fk_refresh_tokens_user` → `users.id` ON DELETE CASCADE | |
| `token_hash` | `CHAR(64)` | NOT NULL, UNIQUE `uq_refresh_tokens_hash` | SHA-256 hex of the token. The token itself is never stored. |
| `expires_at` | `DATETIME` | NOT NULL | Issue time + 7 days. |
| `revoked_at` | `DATETIME` | NULL | Set on refresh, sign-out or reuse. NULL = still usable. |
| `created_at` | `DATETIME` | NOT NULL, DEFAULT CURRENT_TIMESTAMP | |

## Notes

- Rows are never deleted by the application; revoked and expired rows stay until their User is deleted.
