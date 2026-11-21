# modules/auth/auth.cookies.js

## Purpose

Reads, sets and clears the refresh-token cookie, so the cookie's name and flags live in one place. Replaces `cookie-parser` for a single cookie.

## Exports

- **`readRefreshCookie(req)`**: The `refreshToken` cookie's raw value from the `Cookie` header, or `null`.
- **`setRefreshCookie(res, token)`**: `Set-Cookie: refreshToken=<token>; Max-Age=604800; Path=/api/auth; Expires=…; HttpOnly; Secure; SameSite=Strict`.
- **`clearRefreshCookie(res)`**: The same name, path and flags with an expiry in the past.

## Behavior / business rules

- The value is not URL-decoded: a JWT is already cookie-safe, and a tampered value simply fails verification.
- `Path=/api/auth` keeps the cookie off every other request; `SameSite=Strict` keeps it off cross-site requests.

## Dependencies

- **Imports:** `./auth.tokens` (`REFRESH_TOKEN_TTL_SECONDS`)
- **Called by:** `auth.controller.js`

## Notes

- Browsers accept a `Secure` cookie over plain `http://localhost`; any other plain-HTTP host would drop it.
