# Copilot Instructions
## Project Overview
Vanilla JavaScript todo app with per-task time tracking. Runs directly in the browser via `index.html` — no bundler, no Node.js, no frameworks.
## Technology Constraints
- Vanilla JS only — no React, Vue, Angular, jQuery, or any library
- ES modules (`import`/`export`) loaded via `<script type="module">`
- No bundler — no Webpack, Vite, Rollup
- No package manager — no `node_modules`, no `package.json`
- No TypeScript — plain `.js` files
- No localStorage / server — all state lives in memory, resets on reload
## Code Style
- 4-space indentation
- Single quotes for strings in JS
- `camelCase` for variables and functions
- Descriptive function names (e.g., `createTaskItem`, `deleteTodoItem`, `handleTimer`)
- Each file has a single responsibility
- Functions are exported individually (`export function ...`), no default exports
- Constants are UPPER_SNAKE_CASE or PascalCase objects with camelCase keys
## Architecture
| File | Responsibility |
|---|---|
| `index.js` | Bootstrap — binds the "add" button, calls render |
| `data.js` | Shared in-memory state (`taskStoreArray`) |
| `constants.js` | All config: limits, button text, prompt/alert messages |
| `validations.js` | Input validation rules |
| `dom-elements.js` | DOM element factories (`createTaskItem`, `createTitle`, `createButton`, `createControls`) |
| `render.js` | Rendering orchestration (`renderTodoList`, `addTodo`) |
| `actions.js` | Event handlers (`deleteTodoItem`, `editTodoItem`, `toggleDoneStatus`) |
| `timer.js` | Timer factory using closure pattern (`createTimer` → `{ handleTimer, stop }`) |
## Patterns in Use
- **Factory + closure** for timers — `createTimer()` returns an object with private state
- **DOM property storage** — `taskItem.stopTimer = stop` attaches cleanup function to the DOM node
- **Event delegation via `.closest()`** — button handlers find parent `.task-item`
## Task Specifications
Development tasks are stored as markdown files in `tasks/planned/`. Completed tasks move to `tasks/done/`. When working on a task, read the full spec file first — it contains context, analysis, step-by-step instructions, and the list of files to change.
## When Generating Code
- Do NOT suggest `require()` — use `import`/`export` only
- Do NOT add TypeScript types or JSDoc `@type` annotations
- Do NOT introduce new dependencies or build tools
- Keep functions small and focused on one thing
- Put new constants in `constants.js`, new validations in `validations.js`
- Follow existing module boundaries: DOM creation in `dom-elements.js`, event handlers in `actions.js`, rendering in `render.js`
