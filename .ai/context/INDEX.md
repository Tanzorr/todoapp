# Context Index

The router ([`../router/`](../router)) says which of these a mode needs. Do not
read all of them every time.

| Module | Read it when | Answers |
| :--- | :--- | :--- |
| [`ontology.md`](ontology.md) | Planning, modelling, changing what something means | Concepts, relations, I-1…I-10, open questions |
| [`stack.md`](stack.md) | Before running or wiring anything | Versions, ports, env keys, commands |
| [`architecture.md`](architecture.md) | Before adding a file or choosing where code goes | Layers, concept→code map, ADRs |
| [`conventions.md`](conventions.md) | Every time you write code | Naming, DOs/DON'Ts, commits, Definition of Done |
| [`testing.md`](testing.md) | Before claiming something works | Checks T-1…T-12, how to run them |
| [`tools.md`](tools.md) | Searching, editing, running commands | Permission tiers, forbidden operations |
| [`../../backend/specs/`](../../backend/specs/README.md) | Changing one backend file | Per-file contract: exports, errors, rules |

## Cold-Start Reading Order

1. [`../business/VALUE.md`](../business/VALUE.md)
2. [`ontology.md`](ontology.md)
3. [`stack.md`](stack.md)
4. [`architecture.md`](architecture.md)
5. [`conventions.md`](conventions.md)

## Maintenance

Edit modules in place; record changed decisions as ADRs in
[`architecture.md`](architecture.md). Drift you notice while working is fixed as
part of the task.
