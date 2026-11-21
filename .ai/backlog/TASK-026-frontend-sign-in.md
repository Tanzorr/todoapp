# TASK-026 — Sign-in page and tokens in the frontend

| Field | Value |
| :--- | :--- |
| **Status** | `planned` |
| **Priority** | P1 |
| **Value driver** | V-6, V-3 |
| **Depends on** | TASK-025 |
| **Created** | 2026-11-21 |

## Goal

Since TASK-025 every `/api/tasks` call answers `401`, so the task pages show only
errors. After this ticket a person registers or signs in on a page, the task pages
work again with their own Tasks, and signing out returns them to the sign-in page.

## Ontology Touchpoints

**Concepts:** `User`, `RefreshToken`, `ApiError`, `Task`
**Invariants that must hold:** `I-1` (the access token is kept in memory, not in
`localStorage`), `I-7` (the token is attached only in `src/api-client.js`), `I-8`
**New concepts:** none

## Acceptance Criteria

- [ ] AC-1 — Register and sign-in forms; a `400` shows its `message` next to `field`.
- [ ] AC-2 — `src/api-client.js` sends `Authorization: Bearer` on every Task call; on
      `401` it calls `POST /api/auth/refresh` once and retries, else goes to sign-in.
- [ ] AC-3 — A reload keeps the person signed in (refresh cookie), without storing
      the access token in the browser.
- [ ] AC-4 — Sign-out calls `POST /api/auth/logout` and leaves no page usable without
      signing in again.
- [ ] AC-5 — T-9…T-12 pass while signed in; `## Site Map` lists the new page (ADR-012).

## Out of Scope

Password reset, email verification, "remember me" choices.

## Notes

- The frontend (`:8080`) and API (`:3000`) are different origins: the refresh
  cookie needs `credentials: 'include'` on the client and, on the server,
  `Access-Control-Allow-Credentials` with an explicit origin instead of `*`
  (`app.js`). `SameSite=Strict` still sends it — both are the same site, `localhost`.
- The existing Tasks belong to `legacy@todo.invalid`; `backend/README.md` →
  *Existing Tasks* moves them to a real account.
