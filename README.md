# Todo Time Tracker

A vanilla JavaScript todo app with per-task time tracking.

## How to Run

Open `index.html` in a browser. No build tools or server required.

## Tech Stack

- **Vanilla JS** (ES modules, no bundler)
- **HTML5 / CSS3** (no frameworks)
- **No dependencies** — zero `node_modules`

## Project Structure

```
├── index.html          — Entry point, page layout
├── index.js            — Bootstrap: binds "add" button, orchestrates flow
├── data.js             — Shared in-memory state (taskStoreArray)
├── constants.js        — All magic values, button labels, messages
├── validations.js      — Input validation (length, duplicates, empty)
├── dom-elements.js     — DOM factory: creates task items, buttons, controls
├── render.js           — Rendering: clears & rebuilds task list, addTodo()
├── actions.js          — Event handlers: delete, edit, toggle done
├── timer.js            — Timer factory (closure): createTimer() → { handleTimer, stop }
├── style.css           — Styling
└── tasks/              — Task specifications for development
    ├── planned/        — Upcoming tasks
    └── done/           — Completed tasks
```

## Module Dependency Graph

```
index.js
├── data.js
├── constants.js
├── validations.js
└── render.js
    ├── data.js
    └── dom-elements.js
        ├── timer.js
        │   └── constants.js
        ├── constants.js
        └── actions.js
            ├── constants.js
            └── data.js
```

## Key Patterns

- **Factory + closure** for timers — `createTimer()` returns an object with private state via closure
- **DOM property storage** — `taskItem.stopTimer` holds a reference to the timer's `stop()` function for cleanup on delete
- **Event delegation via `.closest()`** — button handlers find their parent `.task-item` via `event.target.closest()`
