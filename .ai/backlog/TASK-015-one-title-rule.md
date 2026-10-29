# TASK-015 — One title-length rule on both sides

| Field | Value |
| :--- | :--- |
| **Status** | `planned` |
| **Priority** | P2 |
| **Value driver** | `V-3` |
| **Depends on** | `TASK-009` |
| **Created** | 2026-10-29 |

## Goal

The user gets the same answer about a title whichever page they use. Today:

| Where | Rule |
| :--- | :--- |
| `src/constants.js` (add page) | 5–50 chars |
| `src/edit.js` | no validation at all |
| `backend/.../tasks.validation.js` | 1–200 chars (authoritative, I-6) |

## Ontology Touchpoints

**Concepts:** `Task`
**Invariants that must hold:** `I-6`

## Acceptance Criteria

- [ ] AC-1 — Add and edit pages apply the same client rule and show the error in `.error-container`.
- [ ] AC-2 — The client rule is no looser than the server's, and the chosen
      bounds are stated in `ontology.md` I-6.
- [ ] AC-3 — The dead duplicate-title check is either removed or made real (decide; ADR if real).
