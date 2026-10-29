# Mode: IMPLEMENT

Build what a ticket describes.

## Load

1. The ticket from [`../backlog/`](../backlog/INDEX.md) — including Out of Scope
2. [`../context/conventions.md`](../context/conventions.md) — every time
3. [`../context/architecture.md`](../context/architecture.md) — layers, concept→code map, ADRs
4. [`../context/stack.md`](../context/stack.md) — commands, env keys
5. [`../context/testing.md`](../context/testing.md) — which checks prove it
6. The invariants the ticket names, from [`../context/ontology.md`](../context/ontology.md)
7. For a backend file: its spec in [`backend/specs/`](../../backend/specs/README.md)

## Sequence

1. **Re-read the acceptance criteria.** Ambiguous → resolve now, not at review.
2. **Locate the seams** via the concept→code map. Read each file fully before editing.
3. **Decide the check first** — which T-n (or new command) will show the AC holds.
4. **Implement the smallest thing** that satisfies the criteria.
5. **Run the checks**: `npm run check`, `node --check` on changed backend files,
   then the T-n rows the change touches.
6. **Update what the change invalidated** — backend spec, ontology, ADR, context module.
7. **Close out**: fill Outcome, set `done`, move the ticket to
   [`../archive/`](../archive/INDEX.md), update both indexes.

## Rules

- **Stay inside the ticket.** Something else broken is a new ticket.
- **Timer state comes from the API** (I-2, I-3). No new client-side source of truth.
- **New concept ⇒ `ontology.md`** in the same change. **New decision ⇒ ADR.**
- **Blocked or the ticket is wrong?** Stop and say so.
- **Never claim a check you did not run.**
