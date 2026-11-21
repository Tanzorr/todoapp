# middleware/authenticate.js

## Purpose

Lets a request through only with a valid access token, and records whose request it is. Every Task and Timer query is scoped by what it sets (I-11).

## Exports

- **`authenticate(req, res, next)`** (middleware): On success sets `req.user = { id }` and calls `next()`.
  - **Errors** (passed to `next`):
    - `401` `Authentication required` — no `Authorization` header, or not `Bearer <token>`.
    - `401` `Invalid or expired access token` — bad signature, expired, wrong secret, `alg: none`, or a non-numeric `sub`.

## Behavior / business rules

- The scheme `Bearer` is matched case-insensitively.
- Stateless: it does not check that the User still exists (no route deletes one). `GET /api/auth/me` does.

## Dependencies

- **Imports:** `../modules/auth/auth.tokens`
- **Called by:** `auth.routes.js` (`/me`)
