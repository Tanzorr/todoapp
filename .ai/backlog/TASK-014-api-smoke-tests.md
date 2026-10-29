# TASK-014 — Automated API checks with `node:test`

| Field | Value |
| :--- | :--- |
| **Status** | `planned` |
| **Priority** | P2 |
| **Value driver** | `V-1`, `V-5` |
| **Depends on** | `TASK-010` |
| **Created** | 2026-10-29 |

## Goal

T-1…T-8 in `testing.md` run with one command instead of by hand, with no new
dependency (`node:test` and global `fetch` ship with Node 20).

## Ontology Touchpoints

**Invariants proven:** `I-2`, `I-4`, `I-5`, `I-6`, `I-7`

## Acceptance Criteria

- [ ] AC-1 — `cd backend && npm test` runs T-1…T-8 against a running API and
      exits non-zero on any failure.
- [ ] AC-2 — Tests create and delete their own Tasks; nothing left behind.
- [ ] AC-3 — Commenting out the `409` branch in `timer.service.startTimer` fails
      T-4 (the test is load-bearing).
- [ ] AC-4 — `testing.md` names the command.

## Out of Scope

- Browser tests (T-9…T-12) — would need a dependency (Playwright); raise separately.
- Spinning MySQL up from the test — non-goal: no Docker.
