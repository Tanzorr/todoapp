# TASK-013 — Stop tracking `backend/.env`

| Field | Value |
| :--- | :--- |
| **Status** | `planned` |
| **Priority** | P0 |
| **Value driver** | `V-5` |
| **Depends on** | — |
| **Created** | 2026-10-29 |

## Goal

Database credentials are not in the repository (I-9, S-5). `backend/.env` is
currently in `git ls-files`.

## Ontology Touchpoints

**Invariants that must hold:** `I-9`

## Acceptance Criteria

- [ ] AC-1 — `.gitignore` lists `.env` (any directory).
- [ ] AC-2 — `git rm --cached backend/.env` committed; the local file still exists.
- [ ] AC-3 — If the committed password is real anywhere (pushed to a remote),
      the owner rotates it. The agent does not read the file to find out.

## Out of Scope

- Rewriting git history — the owner decides; it needs a force-push.
