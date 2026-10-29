# `.ai/` — Spec-Driven Development Layer

What an agent (or a new developer) needs to work on this repo correctly,
versioned and reviewed like code instead of re-explained in every prompt.

Organising idea — **separation of altitudes**:

```
ontology  ──►  PLANNING       what exists, how it relates
context   ──►  IMPLEMENTING   where code goes, how to write it
tools     ──►  ACTING         what may be read, run, changed
```

## Layout

```
.ai/
├── business/VALUE.md         Value drivers V-1…V-5, non-goals, risks
├── context/
│   ├── INDEX.md              Which module to load, and when
│   ├── ontology.md           Concepts, relations, invariants I-1…I-10
│   ├── stack.md              Versions, ports, env keys, commands
│   ├── architecture.md       Layering, concept→code map, ADRs
│   ├── conventions.md        Naming, DOs/DON'Ts, Definition of Done
│   ├── testing.md            How to verify; required checks T-1…T-12
│   └── tools.md              Permission model, search/edit/verify
├── router/                   implement · review
├── backlog/                  INDEX · TEMPLATE · open tickets
└── archive/                  Completed tickets with outcome notes
```

Per-file backend specs stay in [`../backend/specs/`](../backend/specs/README.md);
this layer links to them rather than repeating them.
[`../CLAUDE.md`](../CLAUDE.md) is the entry point.

## Traceability

```
Value driver (V-n) ─► Ontology concept ─► Invariant (I-n)
                                │
                                ▼
                       Ticket (TASK-NNN) ─► Code ─► Check (T-n) ─► Archive
```

A break in the chain is a defect:

- A ticket with no value driver is scope creep.
- An invariant with no check is a promise nobody keeps.
- A concept in code but not in the ontology is a name nobody agreed on.
- An archived ticket with no outcome note is a lost decision.

## Maintenance

- Context describes the **current** system. Edit in place; git holds history.
- A choice between real alternatives becomes an ADR in
  [`context/architecture.md`](context/architecture.md).
- Drift between a module and the code is a defect — a stale file is trusted.
