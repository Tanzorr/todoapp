# modules/auth/auth.validation.js

## Purpose

`zod` schemas for registration and sign-in bodies, run through `lib/validate.js`.

## Exports

- **`validateRegistration(body)`**: Returns `{ email, password }` with `email` trimmed and lowercased.
- **`validateLogin(body)`**: Same shape.
- **Throws** (both): `400` with `field` — see the rules.
- **`emailSchema`**, **`newPasswordSchema`**: the email and register-password rules below, shared with `users.validation.js` so a changed email or password follows the same rules.

## Behavior / business rules

| Field | Rule | Message |
| :--- | :--- | :--- |
| `email` | a string | `Email is required` |
| `email` | ≤ 254 chars after trim | `Email must be 254 characters or fewer` |
| `email` | a valid address after trim + lowercase | `Email must be a valid email address` |
| `password` (register) | a string of ≥ 8 chars | `Password is required` / `Password must be at least 8 characters` |
| `password` (register) | ≤ 72 UTF-8 bytes — bcrypt ignores the rest | `Password must be 72 bytes or fewer` |
| `password` (login) | a non-empty string | `Password is required` |

- Sign-in applies no length rules beyond non-empty, so a rule change never locks out an existing account.

## Dependencies

- **Imports:** `zod`, `../../lib/validate`
- **Called by:** `auth.service.js`, `users.validation.js`
