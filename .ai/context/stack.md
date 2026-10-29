# Stack

## Runtime

| Component | Version | Role |
| :--- | :--- | :--- |
| Browser JS | ES2022 modules, `<script type="module">` | Pages `index` / `add` / `edit` / `show`. Top-level `await` is used |
| Node.js | 20+ (dev machine: 22) | Backend runtime, CommonJS |
| Express | 4.x | HTTP routing |
| mysql2 | 3.x (`mysql2/promise`) | Pool + parameterised queries. No ORM |
| dotenv | 16.x | Loads `backend/.env` |
| MySQL | 8 | `tasks`, `time_entries` |
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
| `DB_NAME` | `todo_app` | Database, must exist before `migrate` |

Read only through `backend/src/config/env.js`.

## Commands

```bash
npm run check                 # root: eslint + prettier --check
npm run lint:fix              # root: eslint autofix
npm run format                # root: prettier --write (reformats files)
cd backend && npm run migrate # applies every .sql in db/migrations, in order
cd backend && npm start
curl -s localhost:3000/health
```

`migrate` re-runs every file each time; migrations must stay idempotent
(`CREATE TABLE IF NOT EXISTS`, guarded `ALTER`).
