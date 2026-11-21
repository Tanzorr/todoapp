# config/env.js

## Purpose

Loads `backend/.env`, validates the auth settings and exports every setting as a named constant. The only file that reads `process.env`.

## Exports

- **`PORT`** (number): Server port, default `3000`.
- **`NODE_ENV`** (string): `'development'` (default) enables dev CORS.
- **`DB_HOST`** (string): MySQL host, default `'localhost'`.
- **`DB_PORT`** (number): MySQL port, default `3306`.
- **`DB_USER`** (string): MySQL user, default `'root'`.
- **`DB_PASSWORD`** (string): MySQL password, default `''`.
- **`DB_NAME`** (string): Database, default `'todo_app'`.
- **`JWT_SECRET`** (string): Signs access tokens. Required.
- **`JWT_REFRESH_SECRET`** (string): Signs refresh tokens. Required.
- **`BCRYPT_ROUNDS`** (number): bcrypt cost, default `12`.
- **`AUTH_RATE_LIMIT`** (number): register + login requests allowed per IP per minute, default `5`.

## Behavior / business rules

- **Fails on load** — so the server, the migration runner and the tests refuse to start — with `Error('[config] …')` when:
  - `JWT_SECRET` or `JWT_REFRESH_SECRET` is missing or under 32 characters;
  - the two secrets are equal;
  - `BCRYPT_ROUNDS` is not an integer from 4 to 31;
  - `AUTH_RATE_LIMIT` is not a positive integer.
- The error names the variable, never its value.
- A variable already in the process environment wins over `.env` (`dotenv` does not override), so `DB_NAME=todo_app_test npm run migrate` targets the test database.

## Dependencies

- **Imports:** `dotenv`, `path`
- **Called by:** every module that needs configuration.

## Notes

- `.env` is resolved as `../../.env` from `src/config/`, i.e. `backend/.env`.
- Secrets differ so a refresh token can never pass as an access token.
