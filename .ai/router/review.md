# Mode: REVIEW

Judge a change against what this project promised, before it is committed.

## Load

1. The diff — `git diff` or `git diff --staged`
2. The ticket it claims to implement
3. [`../context/conventions.md`](../context/conventions.md) — DON'T list, Definition of Done
4. [`../context/ontology.md`](../context/ontology.md) — invariants
5. [`../business/VALUE.md`](../business/VALUE.md) — only if scope looks wrong

## Checklist

**Correctness**
- Every acceptance criterion met, or only most?
- Which invariants does it touch? Is each still true?
- Timer paths: double click, reload while running, delete while running,
  mark done while running, API down. What does the user see?
- Any `await` without `try/catch` on a user action? Any rejected promise that
  leaves the UI showing a state the server does not have?

**Scope**
- Only what the ticket said? Unticketed extras are a finding even when good.
- Crosses a non-goal in `VALUE.md`?

**Layering**
- `fetch` outside `api-client.js`? SQL outside a repository? Business rule in a
  controller? DOM creation outside `dom-elements.js`?
- Name the smell if one fits (Feature Envy, Shotgun Surgery, Primitive
  Obsession); otherwise say plainly that none does.

**Conventions**
- Frontend: named exports, `textContent` for user text, constants in `constants.js`.
- Backend: `'use strict'`, `err.status` errors, `?` placeholders, `env.js` only.
- No `console.log`, no commented-out code, no reformatting mixed with logic.

**Docs**
- Backend behaviour changed → spec updated? New concept → ontology? Decision → ADR?
- Any fact now stated in two files?

## Report

Findings by severity, each: **What** (one sentence) · **Where** (`file:line`) ·
**Why it matters** (the concrete input that goes wrong — otherwise label it a
preference). Separate blocking findings from suggestions. Say plainly when a
change is good.

## Rules

- Review the diff, not the file. Pre-existing problems are new tickets.
- Verify claims — if the ticket says checks pass, run them.
- Do not fix while reviewing.
