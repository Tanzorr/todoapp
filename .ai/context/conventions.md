# Conventions

Rules for every line in this repo. Reasons are given so they apply to cases they
do not literally name.

## Style (both sides)

- 4-space indent, single quotes, semicolons, trailing commas `es5`, width 100 —
  [`.prettierrc`](../../.prettierrc), [`.editorconfig`](../../.editorconfig).
- `camelCase` functions/variables, `UPPER_SNAKE_CASE` constants.
- One responsibility per file. Small functions with a real name.
- No TypeScript, no JSDoc `@type`. No commented-out code, no stray `console.log`.

## Frontend (`src/`, `*.html`, `style.css`)

- ES modules, **named exports only**, no default exports, no `require`.
- File placement: DOM creation → `dom-elements.js` · handlers → `actions.js` ·
  list rendering → `render.js` · constants and UI text → `constants.js` ·
  input rules → `validations.js` · HTTP → `api-client.js` only.
- User text via `textContent` (I-8). `innerHTML` only to clear (`= ''`).
- API failure → `try/catch` → `alert(err.message)` (ADR-005).
- Show what the API reports; do not keep a parallel state the server also has (I-3, I-4).
- Find a row's Task by `event.target.closest('.task-item')` and its `item-id` attribute.

## Backend (`backend/src/`)

- CommonJS, `'use strict';` first line, `module.exports = { … }`.
- A resource is a folder `modules/<plural>/` with
  `<x>.routes.js` · `.controller.js` · `.service.js` · `.repository.js` · `.validation.js`.
- Controller: validate `:id`, call the service, `res.status(…).json(…)`;
  `try { … } catch (err) { next(err); }`.
- Service: business rules, existence checks, validation calls.
- Errors: `const err = new Error(msg); err.status = 4xx; err.field = '…'; throw err;`
- Repository: SQL with `?` placeholders only (I-10); map rows to camelCase.
- Config only via `config/env.js`; never `process.env` elsewhere.
- New migration = new numbered file `NNN_<what>.sql`, idempotent. Never edit an
  applied one.
- Changing a file's exported behaviour updates its spec in `backend/specs/` (ADR-008).

## DON'T

- Don't call `fetch` outside `api-client.js` (I-7).
- Don't store timer state or totals anywhere but `time_entries` (I-2, I-3).
- Don't build SQL by string concatenation of values (I-10).
- Don't add a dependency, framework, bundler or build step (ADR-003) — raise it first.
- Don't commit or read `.env` (I-9).
- Don't widen scope — non-goals are in [`VALUE.md`](../business/VALUE.md).

## Commits

- Conventional prefix, imperative, ≤ 72 chars: `feat: …`, `fix: …`, `style: …`,
  `docs: …`, `refactor: …`, `chore: …`.
- Body: `Ticket: TASK-NNN`.
- One logical change per commit; never mix reformatting with behaviour.

## Definition of Done

1. `npm run check` passes; changed backend files pass `node --check`.
2. Every acceptance criterion verified by running it — see [`testing.md`](testing.md).
3. Every invariant the change touches still holds — named in the ticket.
4. Backend exported behaviour changed ⇒ matching `backend/specs/` file updated.
5. Decision made ⇒ ADR in [`architecture.md`](architecture.md).
6. Concept added or renamed ⇒ [`ontology.md`](ontology.md) updated.
7. Ticket has an Outcome and is moved to [`../archive/`](../archive/INDEX.md).
