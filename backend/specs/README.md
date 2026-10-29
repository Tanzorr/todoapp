# Backend Specification Folder

This folder mirrors the structure of `backend/src/` and contains English-language specifications for every file in the backend codebase. Each spec is written to be understandable by both humans and AI systems.

## Convention

- **One spec per source file:** For each `.js` file in `backend/src/`, there is a corresponding `.md` spec file at the same relative path in `backend/specs/`.
- **For example:** `backend/src/modules/tasks/tasks.service.js` → `backend/specs/modules/tasks/tasks.service.md`

## Structure of a spec

Each specification follows this template:

- **Purpose:** 1–2 sentences explaining why the file exists and its role in the layered flow.
- **Exports:** For each exported function: signature, parameter types and meanings, return shape, and possible thrown errors (with HTTP status codes and conditions).
- **Behavior / business rules:** Bullet points of logic that isn't obvious from the function signature alone — validation rules, edge cases, defaults, ordering.
- **Dependencies:** Internal modules this file imports and what depends on it.
- **Notes:** Anything a reimplementer in another language/stack should know (env-only behavior, SQL dialect specifics, etc.).

## Authority

- **Specs are the source of truth for *intent*:** Why does this layer exist? What is it supposed to do?
- **Source code is the source of truth for *exact behavior*:** When specs and code conflict, the code is correct and the spec must be updated.
- **Maintenance:** Whenever you modify a source file's exported behavior, update the matching spec file. This is a manual discipline, not automated.

## Use cases

- **Onboarding:** New team members and AI assistants can understand the backend's logic without reading implementation.
- **Code generation:** In the future, these specs could serve as input for generating equivalent code in another language (Python, Go, etc.) — the specs document contracts, edge cases, and error handling clearly enough to regenerate from.
- **Documentation:** A living record of what each layer is supposed to do, decoupled from implementation details.
