# TASK-012 — `npm run check` passes

| Field | Value |
| :--- | :--- |
| **Status** | `planned` |
| **Priority** | P1 |
| **Value driver** | `V-4` |
| **Depends on** | `TASK-009` |
| **Created** | 2026-10-29 |

## Goal

The Definition of Done's first item is achievable again. On 2026-10-29
`npm run check` fails with:

- ESLint parse errors — top-level `await` in `src/index.js`, `src/edit.js`,
  `src/show.js` vs `ecmaVersion: 2020` in `eslint.config.mjs`.
- Prettier — `src/action-button.js`, `src/api-client.js`, `src/dom-elements.js`.

## Ontology Touchpoints

**Concepts:** none. **Invariants:** none changed.

## Acceptance Criteria

- [ ] AC-1 — `npm run check` exits 0.
- [ ] AC-2 — Formatting lands in its own commit, separate from the config change.

## Out of Scope

- Linting `backend/` (needs a Node/CommonJS config block) — separate ticket if wanted.
