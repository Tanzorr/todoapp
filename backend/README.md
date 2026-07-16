# Todo Backend

Node.js + Express REST API for the Todo + Timer app.

## Requirements

- Node.js 20+
- MySQL 8+

## Setup

```bash
cd backend
cp .env.example .env
# Edit .env — set DB_USER, DB_PASSWORD, DB_NAME
npm install
```

## Run the server

```bash
npm start
# Server starts on http://localhost:3000
# Health check: http://localhost:3000/health
```

## Run database migrations

```bash
# Ensure MySQL is running and DB_NAME database exists
npm run migrate
```

## API Endpoints

| Method | URL | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/api/tasks` | List all tasks |
| GET | `/api/tasks/:id` | Get task by id |
| POST | `/api/tasks` | Create task `{ title }` |
| PUT | `/api/tasks/:id` | Update task `{ title?, done? }` |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/tasks/:id/timer` | Get timer total |
| POST | `/api/tasks/:id/timer/start` | Start timer |
| POST | `/api/tasks/:id/timer/stop` | Stop timer |

See `tasks/planned/backend-api-contract-v1.md` for full request/response examples.

## Project Structure

```
src/
  config/env.js          — environment variables
  db/
    pool.js              — mysql2 connection pool
    migrate.js           — migration runner
    migrations/          — .sql migration files
  middleware/
    error-handler.js     — centralized error handler
    not-found.js         — 404 handler
  modules/
    tasks/               — tasks CRUD
    timer/               — timer start/stop/total
  app.js                 — Express app
  server.js              — entry point

specs/
  README.md              — specification convention and index
  [mirrors src/ structure] — English-language spec for each source file
```

See `specs/README.md` for documentation on the SDD (Specification-Driven Development) conventions used in this project.

