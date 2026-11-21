# Stack

## Runtime

| Component | Version | Role |
| :--- | :--- | :--- |
| Browser JS | ES2022 modules, `<script type="module">` | Pages `index` / `add` / `edit` / `show`. Top-level `await` is used |
| Node.js | 20+ (dev machine: 22) | Backend runtime, CommonJS |
| Express | 4.x | HTTP routing |
| mysql2 | 3.x (`mysql2/promise`) | Pool + parameterised queries. No ORM |
| dotenv | 16.x | Loads `backend/.env` |
| bcryptjs | 3.x | Password hashes (ADR-016) |
| jsonwebtoken | 9.x | Access and refresh JWTs, HS256 |
| zod | 4.x | Every input validator, via `lib/validate.js` |
| express-rate-limit | 8.x | Register / login limit, in memory |
| MySQL | 8 | `users`, `refresh_tokens`, `tasks`, `time_entries`, `schema_migrations` |
| ESLint / Prettier | 9 / 3 (root devDeps) | Frontend lint + format. Backend is **not** linted yet |

Two separate `package.json` files: root = frontend tooling only; `backend/` =
the server. Neither has a bundler.

## Processes and Ports

| What | Command | Address |
| :--- | :--- | :--- |
| API | `cd backend && npm start` | `http://localhost:3000` (`/health`, `/api/...`) |
| Static frontend | `python3 -m http.server 8080` from the root | `http://localhost:8080` |

ES modules do not load from `file://`, so the frontend must be served. CORS `*`
is enabled only when `NODE_ENV=development`. The API base URL is hard-coded in
`src/api-client.js`.

## Environment (`backend/.env`)

Names and meaning only — values come from `backend/.env.example`.

| Key | Default | Meaning |
| :--- | :--- | :--- |
| `PORT` | `3000` | API port |
| `NODE_ENV` | `development` | Enables dev CORS |
| `DB_HOST` / `DB_PORT` | `localhost` / `3306` | MySQL |
| `DB_USER` / `DB_PASSWORD` | `root` / empty | MySQL credentials |
| `DB_NAME` | `todo_app` | Database, must exist before `migrate`. Tests always use `todo_app_test` |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | none — required | ≥ 32 chars each, different; the server refuses to start otherwise |
| `BCRYPT_ROUNDS` | `12` | bcrypt cost, 4–31 |
| `AUTH_RATE_LIMIT` | `5` | Register + login requests per IP per minute |

Read only through `backend/src/config/env.js`.

## Commands

```bash
npm run check                 # root: eslint + prettier --check
npm run lint:fix              # root: eslint autofix
npm run format                # root: prettier --write (reformats files)
cd backend && npm run migrate       # applies pending migrations, in order
cd backend && npm run migrate:down  # undoes the last one; only on a *_test DB without -- --force
cd backend && npm start
cd backend && npm test              # node:test against todo_app_test
curl -s localhost:3000/health
```

`migrate` applies only files missing from `schema_migrations` (ADR-017). Run
either command against another database with `DB_NAME=todo_app_test npm run …` —
a variable already set wins over `backend/.env`.
