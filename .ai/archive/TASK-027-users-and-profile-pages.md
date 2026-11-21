# TASK-027 — Users page for the admin, and an editable profile page

| Field | Value |
| :--- | :--- |
| **Status** | `done` |
| **Priority** | P2 |
| **Value driver** | V-6 |
| **Depends on** | TASK-025, TASK-026 |
| **Created** | 2026-11-21 |

## Goal

Every person has a profile page where they change their name, email and password, or
delete their account. An admin also has a page listing every User, and can open any
User's profile to read it — never to change it.

## Ontology Touchpoints

**Concepts:** `User`, `RefreshToken`, `Task`, `ApiError`
**Invariants that must hold:** `I-11`, `I-12` (amended: the hash also reaches the
current-password check), `I-13`
**New concepts:** none — `User` gains `name` and `role` (`user` | `admin`), and a new
invariant:

| # | Invariant |
| :--- | :--- |
| I-14 | Only an admin sees other Users, and only to read them. A non-admin asking for another User, or for the list, gets `404`. No route changes another User. |

## Decisions

**Confirmed by the owner 2026-11-21.**

| # | Question | Answer |
| :--- | :--- | :--- |
| D1 | Who sees the list of Users | Admin only. `users.role` column; the first admin is set with one `UPDATE` |
| D2 | What a profile can change | Name, email, password, and delete the account |
| D3 | Whose profile can be changed | Only your own. An admin reads others' profiles |
| D4 | How a sensitive change is confirmed | Email, password and deletion need the current password; a wrong one is `400` with `field: "currentPassword"` — not `401`, which the client reads as an expired session |
| D5 | What a password change does to sessions | Revokes every RefreshToken of the User and starts a new session for the browser that made the change |

## Acceptance Criteria

- [x] AC-1 — Migration 005 adds `users.name` (NULL) and `users.role` (default `user`);
      its down file removes both. Every `User` response carries `name` and `role`.
- [x] AC-2 — `GET /api/users`: admin → `200` list with `taskCount`, no
      `password_hash`; anyone else → `404`.
- [x] AC-3 — `GET /api/users/me` → own profile. `GET /api/users/:id` → `200` for
      yourself or an admin, else `404`.
- [x] AC-4 — `PATCH /api/users/me` `{ name }`: 0–80 chars after trim, `''` clears it.
- [x] AC-5 — `PUT /api/users/me/email`: wrong current password → `400`; taken → `409`;
      otherwise `200`, and the new email signs in.
- [x] AC-6 — `PUT /api/users/me/password`: wrong current → `400`; new under 8 chars →
      `400` `field: "newPassword"`; otherwise `200 { accessToken, user }` and a new
      cookie, every older RefreshToken revoked, the old password no longer signs in.
- [x] AC-7 — `DELETE /api/users/me` `{ currentPassword }`: wrong → `400`; otherwise
      `204`, cookie cleared, and the User's Tasks, TimeEntries and RefreshTokens gone.
- [x] AC-8 — `users.html`: the admin sees every User, each linking to its profile; anyone
      else sees "Only an admin can see this page." The header shows **Users** to the
      admin only, and the name (or email) links to the profile.
- [x] AC-9 — `user.html`: own profile with four forms; a `400` shows under its field.
      `user.html?id=<other>`: read-only for the admin, "User not found." for anyone else.
- [x] AC-10 — `npm test` covers AC-2…AC-7; `npm run check` passes; `## Site Map` lists
      both pages.

## Out of Scope

- Changing another User, or anyone's role, from the app — roles change by SQL.
- Password reset by email, avatars.

## Notes

- Email, password and deletion share the register/login rate limit.
- An access token outlives its deleted User by up to 15 minutes; requests with it see
  no Tasks, and creating one fails.

---

## Outcome

**Completed:** 2026-11-21 (`ade6e21`)
**What was built:** Migration 005 (`name`, `role`); `modules/users/` with routes,
controller, service and validation; `auth.service` exports `issueSession`,
`hashPassword`, `verifyPassword`; `auth.validation` shares `emailSchema` and
`newPasswordSchema`. Frontend: `users.html` + `src/users.js`, `user.html` +
`src/user.js` + `src/profile-forms.js`; the header shows the name (or email) linking to
the profile and **Users** for the admin; `showFormError()` in `feedback.js` now serves
the sign-in form too, whose classes became `field-*` / `form-error`. ADR-020, I-14.
`me@todo.local` on `todo_app` is the admin.
**Deviations from the plan:** none.
**Verified how:** `npm test` 33/33 (8 new in `users.test.js`); `npm run check` (only the
old `show.js` warning); 005 up, down, up on `todo_app_test`; applied on `todo_app`.
Chrome headless over CDP against the live API, 25/25: non-admin header has no Users
link, `users.html` → admin-only notice, `user.html?id=<admin>` → "User not found.";
name saved and the header follows; wrong current password shows under its field and
does not sign out; email and password changed, still signed in after a reload; old
password refused, new email + password sign in; admin sees the Users link, the list
with name, email and badges, and a row opens a read-only profile; delete with a wrong
password → field error, with the right one → `login.html`, and the account cannot sign
in; 390 px wide with no horizontal scroll. The API ran with the rate limit raised to
100 for this run and was restarted at 5. Probe Users deleted.
**Follow-ups raised:** none.
