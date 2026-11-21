# modules/users/users.validation.js

## Purpose

`zod` schemas for profile changes and the `:id` parameter, run through `lib/validate.js`.

## Exports

- **`validateName(body)`** → `{ name }` trimmed.
- **`validateEmailChange(body)`** → `{ email, currentPassword }`, email trimmed and lowercased.
- **`validatePasswordChange(body)`** → `{ currentPassword, newPassword }`.
- **`validateDeletion(body)`** → `{ currentPassword }`.
- **`validateUserId(id)`** → integer. Same rule as task ids: `parseInt`, then a positive integer.
- **Throws** (all): `400` with `field`, except `validateUserId` (`Invalid user id`, no field).

## Behavior / business rules

| Field | Rule | Message |
| :--- | :--- | :--- |
| `name` | a string, ≤ 80 chars after trim | `Name must be text` / `Name must be 80 characters or fewer` |
| `email` | the register rule (`emailSchema` from `auth.validation.js`) | as there |
| `currentPassword` | a non-empty string | `Current password is required` |
| `newPassword` | the register password rule (`newPasswordSchema`) | `Password must be at least 8 characters` / `… 72 bytes or fewer` |

## Dependencies

- **Imports:** `zod`, `../../lib/validate`, `../auth/auth.validation`
- **Called by:** `users.service.js`, `users.controller.js`
