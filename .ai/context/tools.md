# Tool Usage

The enforced half is [`../../.claude/settings.json`](../../.claude/settings.json);
this file gives the intent.

## Permission Tiers

| Tier | Contents | Why |
| :--- | :--- | :--- |
| **Allowed** | Reading the repo; `rg`, `find`, `jq`, `ls`, `git status/log/diff/show`; `npm run lint`/`check`; `node --check`; `curl -s localhost:3000/health` and `/api/tasks` | Reversible, no side effects |
| **Ask first** | Any other `curl` (it can write to the DB); `npm install`/`ci`/`uninstall`, `npm run format`/`lint:fix`, `npm run migrate`, `npm start`, `mysql`, `git add/commit/push/reset/checkout/stash/rebase`, editing `package.json`, lockfiles, `.env.example`, `.gitignore` | Changes dependencies, schema, history or many files at once |
| **Denied** | Reading/editing `.env`, `backend/.env`, keys; `rm -rf`; `git push --force`; `DROP`/`TRUNCATE` via `mysql` | No legitimate need for a secret or for destroying data |

`backend/.env` is still tracked in git (TASK-013), so `git show`/`git log -p` can
print it. Do not run them on that path — the deny rule cannot catch every form.

## Searching

```bash
rg -n 'getTimerTotal' src backend/src     # symbol across both sides
rg -l 'innerHTML' src                     # I-8 audit
rg -n 'query\(' backend/src               # I-10: should hit only repositories + pool
rg -n 'fetch\(' src                       # I-7: should hit only api-client.js
jq '.scripts' package.json backend/package.json
```

Exclude `node_modules/`. Search by ontology term first; no hit means not built.

## Editing

- Read the file before editing it.
- Targeted replacements, not whole-file rewrites.
- One concern per edit; never reformat a file you are also changing — run
  `npm run format` as its own step if asked.

## Verifying

See [`testing.md`](testing.md). Run the check; don't reason about whether it
would pass.

## Hard Rules

1. Never read `.env` / `backend/.env`.
2. No destructive command unless asked.
3. No commit or push unless asked.
4. No new dependency without raising it.
5. No writes outside the project root.
6. Report what happened — failures with output, skipped steps named.
