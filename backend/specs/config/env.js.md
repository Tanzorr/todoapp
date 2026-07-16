# config/env.js

## Purpose

Loads and validates environment variables from the `.env` file and exports them as named constants. Acts as the single source of truth for configuration across the application.

## Exports

- **`PORT`** (number): Server port, read from `process.env.PORT`, default `3000`.
- **`NODE_ENV`** (string): Deployment environment (`'development'`, `'production'`, etc.), default `'development'`.
- **`DB_HOST`** (string): MySQL server hostname, default `'localhost'`.
- **`DB_PORT`** (number): MySQL server port, parsed from env, default `3306`.
- **`DB_USER`** (string): MySQL username, default `'root'`.
- **`DB_PASSWORD`** (string): MySQL password, default empty string `''`.
- **`DB_NAME`** (string): MySQL database name, default `'todo_app'`.

## Behavior / business rules

- Loads `.env` file from the project root (resolved relative to the `config/` directory).
- Uses `dotenv`'s `config()` to populate `process.env`.
- `DB_PORT` is parsed to an integer; all others are strings or numbers as noted.
- All variables have sensible defaults if not set in `.env`.

## Dependencies

- **Imports:** `dotenv`, `path` (Node.js built-in)
- **Depends on:** All other modules import from this file to get their config.

## Notes

- The `.env` file is loaded relative to `__dirname` (the `config/` folder), not the project root. The path is adjusted with `../../.env` to reach the root.
- Defaults are meant for local development; production deployments must set `NODE_ENV`, database credentials, and optionally `PORT` via environment variables.
