# Copilot Instructions

The project's agent instructions live in [`CLAUDE.md`](../CLAUDE.md) and the
[`.ai/`](../.ai/README.md) folder. They are the source of truth; this file is a
summary for tools that read only this path.

## Project

Todo list with a per-task timer. Vanilla-JS pages (`index`, `add`, `edit`,
`show`) call a Node + Express API in `backend/`, backed by MySQL.

## Must-know rules

- Domain terms and invariants: [`.ai/context/ontology.md`](../.ai/context/ontology.md).
  Timer state is derived from `time_entries` on the server — never stored in the browser.
- Where code goes: [`.ai/context/architecture.md`](../.ai/context/architecture.md).
- How to write it: [`.ai/context/conventions.md`](../.ai/context/conventions.md).
  - Frontend: ES modules, named exports, no frameworks, no build step,
    `fetch` only in `src/api-client.js`, user text via `textContent`.
  - Backend: CommonJS, routes → controller → service → repository, SQL with `?`
    placeholders only in repositories.
- Work against a ticket in [`.ai/backlog/`](../.ai/backlog/INDEX.md).
- Never read or commit `.env`; never add a dependency without asking.
