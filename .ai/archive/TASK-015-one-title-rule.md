# TASK-015 — One title-length rule on both sides

| Field | Value |
| :--- | :--- |
| **Status** | `done` |
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

- [x] AC-1 — Add and edit pages apply the same client rule and show the error in `.error-container`.
- [x] AC-2 — The client rule is no looser than the server's, and the chosen
      bounds are stated in `ontology.md` I-6.
- [x] AC-3 — The dead duplicate-title check is either removed or made real (decide; ADR if real).

---

## Outcome

**Completed:** 2026-11-05
**What was built:** `MAX_TASK_LENGTH` 200, `MIN_TASK_LENGTH` removed, `taskValidation(title)` measures after trim. `edit.js` validates on form `submit`, so Enter and the floating button pass the same check.
**Deviations from the plan:** none. AC-3 decided: the duplicate check is removed; it never ran (`add.js` passed `[]`) and uniqueness is not an invariant.
**Verified how:** Chrome 136 headless over CDP, 9 of 9: blank and 201 chars refused on both pages with the message in `.error-container`, no POST row and no PUT sent; 1 char accepted. T-2 pass on the server.
**Follow-ups raised:** none.
