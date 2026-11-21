# TASK-026 — Sign-in page and tokens in the frontend

| Field | Value |
| :--- | :--- |
| **Status** | `in-progress` — built and verified; not committed yet |
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

- [x] AC-1 — Register and sign-in forms; a `400` shows its `message` next to `field`.
- [x] AC-2 — `src/api-client.js` sends `Authorization: Bearer` on every Task call; on
      `401` it calls `POST /api/auth/refresh` once and retries, else goes to sign-in.
- [x] AC-3 — A reload keeps the person signed in (refresh cookie), without storing
      the access token in the browser.
- [x] AC-4 — Sign-out calls `POST /api/auth/logout` and leaves no page usable without
      signing in again.
- [x] AC-5 — T-9…T-12 pass while signed in; `## Site Map` lists the new page (ADR-012).

## Out of Scope

Password reset, email verification, "remember me" choices.

## Notes

- The frontend (`:8080`) and API (`:3000`) are different origins: the refresh
  cookie needs `credentials: 'include'` on the client and, on the server,
  `Access-Control-Allow-Credentials` with an explicit origin instead of `*`
  (`app.js`). `SameSite=Strict` still sends it — both are the same site, `localhost`.
- The existing Tasks belong to `legacy@todo.invalid`; `backend/README.md` →
  *Existing Tasks* moves them to a real account.

---

## Outcome

**Completed:** 2026-11-21 (archived once committed)
**What was built:** `login.html` + `src/login.js` + `src/auth-form.js` — one form that
switches between Sign in and Create an account; a `400` lands under its field, anything
else (`401`, `409`, `429`) above the buttons; `?next=` returns to the page that sent you,
and only a bare `*.html` name is accepted. `src/account.js` puts the email and a Sign out
button in the header of index, add, show and edit. `src/api-client.js` keeps the access
token in memory, renews it with one shared refresh per page, retries a `401` once, and
otherwise sends the user to `login.html` without an alert. `app.js` answers CORS for
local origins with credentials. ADR-019.
**Deviations from the plan:** the API host now follows the page's host (`localhost` or
`127.0.0.1`), so the `SameSite=Strict` cookie is sent either way. No client-side
validation on the form — the server's messages are shown as they are.
**Verified how:** `npm run check` (1 warning, the old `console.error` in `show.js`);
`cd backend && npm test` 25/25. Chrome headless over CDP against the live API on
`todo_app`, 25/25: redirect to `login.html?next=index.html` with no alert; register
with a 5-char password → message under Password and `aria-invalid`; register → index
with the email in the header; no token in `localStorage`/`sessionStorage`, cookie not in
`document.cookie`; T-9, T-12; T-10 running after 3 reloads, still signed in (9 refresh
calls for 9 page loads); T-11 with no console error; Sign out → `show.html` sends to
`login.html?next=show.html`; wrong password → form error; sign in returns to `show.html`;
`?next=https://evil.example/` → `index.html`; 390 px wide, no horizontal scroll. The 6th
sign-in inside a minute showed `Too many attempts, try again in a minute` (AC-11 of
TASK-025, as designed). Probe users deleted afterwards.
**Follow-ups raised:** none.
