# TASK-021 — Implement the task-pages redesign

| Field | Value |
| :--- | :--- |
| **Status** | `planned` |
| **Priority** | P2 |
| **Value driver** | `V-3`, `V-1` |
| **Depends on** | `TASK-011`, `TASK-012`, `TASK-015` |
| **Created** | 2026-11-05 |

## Goal

Build the redesign step by step. [TASK-020](TASK-020-redesign-task-pages.md) says
what the pages must do; this ticket shows the code before and after each step and
how to prove it. Both close together.

## Ontology Touchpoints

**Concepts, invariants:** as in TASK-020.
**New concepts:** none.

## Acceptance Criteria

- [ ] AC-1 — Every AC in TASK-020 is ticked, and the Outcome gives the result of its check from [Steps](#steps).
- [ ] AC-2 — `grep -rnE 'alert\(|action-button|page-action-btn|breadcrumbs|BUTTON_TEXT\.pause' src *.html style.css` finds nothing.
- [ ] AC-3 — `grep -nE 'alert\(|pause|floating|breadcrumbs|action-button' .ai/context/conventions.md .ai/context/architecture.md .ai/business/VALUE.md` hits only ADR records.
- [ ] AC-4 — Every decision in [Notes](#notes) holds in the code, or the Outcome states the deviation and why.

## Before Starting

| Check | If it fails |
| :--- | :--- |
| TASK-011, TASK-012, TASK-015 are archived | Do them first |
| The TASK-011 ADR chooses the server-side stop | Stop: TASK-020 assumes it, so the ticket is wrong |
| `npm run check` exits 0 | TASK-012 is not really done |
| `MAX_TASK_LENGTH` agrees with I-6 | TASK-015 is not really done |

## Steps

Go in order. Each step is one logical change and leaves all four pages working.
Browser checks are by hand, in a stated browser
([`testing.md`](../context/testing.md)).

| Steps | `Before` is | `After` is |
| :--- | :--- | :--- |
| 1–2 | `5ebd3d5` | Committed code: `9ce8eb9`, `002ee24` |
| 3 | `002ee24` | The working tree on 2026-11-05, not committed yet |
| 4–9 | The previous step's `After` | Proposed and not run: fix it if a check fails |

Snippets show what changes; `…` marks code left out.

| Step | What | Files added or deleted | TASK-020 |
| :--- | :--- | :--- | :--- |
| 1 | Page shell and styles | — | AC-13, AC-14, part of AC-12 |
| 2 | Shared helpers | Added `src/feedback.js` | Groundwork |
| 3 | List row | — | AC-1, AC-2, AC-3, AC-4, AC-6, AC-7 |
| 4 | Delete on the row | — | AC-5 (row) |
| 5 | List states | — | AC-8, AC-9 (list) |
| 6 | Show page | — | AC-10, AC-5 (show) |
| 7 | Shared form | Added `src/task-form.js`, deleted `src/action-button.js` | AC-11, AC-9 (rest) |
| 8 | Docs | — | Notes of TASK-020 |
| 9 | Final pass and close-out | Tickets moved to `archive/` | AC-12, AC-13, AC-15 |

### Step 1 — Page shell and styles

**Changed:** `index.html`, `add.html`, `edit.html`, `show.html`, `style.css`

**Page head.** Same on all four pages, each with its own `<title>`.

Before, `index.html`:

```html
<html lang="">
<head>
    <title>to do time trac</title>
    <link rel="stylesheet" href="style.css"/>
</head>
```

After:

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tasks — My todo</title>
    <link rel="stylesheet" href="style.css"/>
</head>
```

**Header and footer, no breadcrumbs.**

Before, `index.html`:

```html
<header class="header">
    <div class="container">
        <h1 class="title"> My todo </h1>
    </div>
</header>
<div class="content container">
    <nav class="breadcrumbs"><a href="index.html">Home</a> / <span>Tasks</span></nav>
    <!-- … -->
</div>
<footer class="footer">
    <div class="container">
        2025 alex@ukr.net
    </div>
</footer>
```

After:

```html
<header class="site-header">
    <div class="site-header-inner">
        <a class="site-name" href="index.html">My todo</a>
    </div>
</header>
<main class="page-main">
    <!-- … -->
</main>
<footer class="site-footer">2025 alex@ukr.net</footer>
```

**Colours and fonts become tokens.**

Before, `style.css`:

```css
.header, .footer{
    background: black;
    color: white;
    padding: 24px 0;
}
```

After:

```css
:root {
    --ink: #111;
    /* … */
    --gold: #f2c94c;
    --font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, Ubuntu, sans-serif;
    /* … */
}

.site-header {
    background: var(--ink);
    color: #fff;
}
```

**Added to `style.css`:** focus ring and reduced motion.

```css
a:focus-visible, button:focus-visible, input:focus, textarea:focus {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
    * {
        animation: none !important;
        transition: none !important;
    }
}
```

**Stays for now:** the floating `.page-action-btn` (steps 5–7), gold on the delete
button (step 3), gold on form fields and `outline: none` (step 7).

**Check**

- [ ] The Network tab shows requests to `localhost` only.
- [ ] `grep -E '@font-face|@import|https?:' style.css` finds nothing.

### Step 2 — Shared helpers

**Added:** `src/feedback.js`
**Changed:** `src/timer.js`, `src/api-client.js`, `src/constants.js`, `src/dom-elements.js`

**New file `src/feedback.js`:** busy state and inline errors. It imports only
`constants.js` (`createIcon`, left out here, draws from `ICONS`).

```js
// feedback.js — busy state and inline errors. A leaf: it imports only constants, so timer.js,
// actions.js and validations.js can use it without an import cycle through dom-elements.js.
import { ICONS } from './constants.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const refocusAfterBusy = new WeakSet();

// …

export function setBusy(button, busy) {
    if (busy && document.activeElement === button) {
        refocusAfterBusy.add(button);
    }
    button.disabled = busy;
    button.classList.toggle('is-busy', busy);
    button.setAttribute('aria-busy', String(busy));
    if (!busy && refocusAfterBusy.delete(button)) {
        button.focus();
    }
}

export function showInlineError(slot, message) {
    const returnFocusTo = document.activeElement;

    const box = document.createElement('div');
    box.classList.add('inline-error');
    box.setAttribute('role', 'alert');

    const text = document.createElement('span');
    text.classList.add('inline-error-text');
    text.textContent = message;

    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.classList.add('btn', 'btn-icon', 'inline-error-dismiss');
    dismiss.setAttribute('aria-label', 'Dismiss');
    dismiss.append(createIcon('close'));
    dismiss.addEventListener('click', () => {
        box.remove();
        returnFocusTo?.focus();
    });

    box.append(createIcon('alert'), text, dismiss);
    slot.replaceChildren(box);
}

export function clearInlineError(slot) {
    slot.replaceChildren();
}
```

**New function in `src/timer.js`.** Step 3 uses it.

```js
export function formatTime(totalSeconds) {
    const parts = [
        Math.floor(totalSeconds / 3600),
        Math.floor((totalSeconds % 3600) / 60),
        totalSeconds % 60,
    ];
    return parts.map((part) => String(part).padStart(2, '0')).join(':');
}
```

**`apiFetch` gives a readable message and keeps `.field`.**

Before, `src/api-client.js`:

```js
async function apiFetch(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'API error');
    return data;
}
```

After:

```js
async function apiFetch(path, options = {}) {
    let res;
    try {
        res = await fetch(`${BASE_URL}${path}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });
    } catch {
        throw new Error(ALERTS.serverDown);
    }
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) {
        const err = new Error(data.error?.message || 'API error');
        err.field = data.error?.field;
        throw err;
    }
    return data;
}
```

**Button text: `Stop`, not `pause`.**

Before, `src/constants.js`:

```js
    start: 'start',
    pause: 'pause',
```

After:

```js
    start: 'Start',
    stop: 'Stop',
```

Before, `src/dom-elements.js`:

```js
            controlButton.textContent = running ? BUTTON_TEXT.pause : BUTTON_TEXT.start;
```

After:

```js
            controlButton.textContent = running ? BUTTON_TEXT.stop : BUTTON_TEXT.start;
```

**Added to `src/constants.js`:** `ICONS` (`plus`, `check`, `start`, `stop`, `edit`,
`trash`, `alert`, `close`) and this message:

```js
    serverDown: "The server isn't responding. Check that it's running, then try again.",
```

**Check**

- [ ] T-4, T-5, T-6 pass (required when `api-client.js` changes).

### Step 3 — List row

**Changed:** `index.html`, `src/dom-elements.js`, `src/render.js`, `src/actions.js`,
`src/timer.js`, `src/constants.js`, `style.css`, `.ai/context/architecture.md`,
`.ai/context/conventions.md`

**Running count and total on the page.**

Before, `index.html`:

```html
        <a class="site-name" href="index.html">My todo</a>
    </div>
</header>
<main class="page-main">
    <a class="edit-task-btn btn" href="./add.html">add page</a>
    <div class="items-container">
    </div>
</main>
```

After:

```html
        <a class="site-name" href="index.html">My todo</a>
        <span class="running-count" hidden>
            <span class="dot"></span>
            <span class="running-label"></span>
        </span>
    </div>
</header>
<main class="page-main">
    <a class="edit-task-btn btn" href="./add.html">add page</a>
    <div class="list-card">
        <div class="items-container"></div>
        <div class="list-total" hidden>
            <span class="list-total-label">Total</span>
            <span class="list-total-value"></span>
            <span class="list-total-spacer"></span>
        </div>
    </div>
</main>
```

**New row: done, title link, time, Start/Stop, edit icon, delete icon.**

Before, `src/dom-elements.js`:

```js
export function createControls(taskId, workingTime = 0, isRunning = false) {
    const container = document.createElement('div');
    container.classList.add('task-controls');

    const editButton = createButton(BUTTON_TEXT.edit, editTodoItem);
    const doneButton = createButton(BUTTON_TEXT.done, toggleDoneStatus);
    const deleteButton = createButton(BUTTON_TEXT.delete, deleteTodoItem);

    const timerButton = createButton('');
    const controlButton = createButton('', async () => {
        try {
            await toggle();
        } catch (err) {
            alert(err.message);
        }
    });

    const { toggle, sync, stop } = createTimer(
        taskId,
        workingTime,
        isRunning,
        (seconds, running) => {
            timerButton.textContent = `${seconds} s`;
            controlButton.textContent = running ? BUTTON_TEXT.stop : BUTTON_TEXT.start;
        }
    );

    container.append(editButton, doneButton, deleteButton, controlButton, timerButton);

    return { container, stopTimer: stop, syncTimer: sync };
}
```

After:

```js
// A link to show or edit: remembers the SelectedTask for that page, also on a middle click.
function createTaskLink(taskId, text, href, classes) {
    const link = createLink(text, href, classes);
    const select = () => saveTaskId(taskId);
    link.addEventListener('click', select);
    link.addEventListener('auxclick', select);
    return link;
}

function createDoneToggle(taskTitle) {
    const button = createButton('', toggleDoneStatus, ['btn-icon', 'done-toggle']);
    button.setAttribute('aria-label', ARIA_LABELS.done(taskTitle));
    const box = createElement('span', ['check-box']);
    box.append(createIcon('check'));
    button.append(box);
    return button;
}

export function renderTimerButton(button, running, taskTitle) {
    const label = running ? BUTTON_TEXT.stop : BUTTON_TEXT.start;
    if (button.textContent === label) return;
    button.replaceChildren(createIcon(running ? 'stop' : 'start'), label);
    button.classList.toggle('btn-primary', running);
    button.classList.toggle('btn-outline', !running);
    button.setAttribute('aria-label', (running ? ARIA_LABELS.stop : ARIA_LABELS.start)(taskTitle));
}

function createControls(taskItem, task, totalSeconds, isRunning) {
    const container = createElement('div', ['task-controls']);

    const dot = createElement('span', ['dot']);
    const timeValue = createElement('span');
    const time = createElement('span', ['task-time']);
    time.append(dot, timeValue);
    const timeSlot = createElement('div', ['task-time-slot']);
    timeSlot.append(time);

    const timerButton = createButton('', toggleTimer, ['timer-btn']);

    const editLink = createTaskLink(task.id, '', 'edit.html', ['btn', 'btn-icon', 'btn-ghost']);
    editLink.setAttribute('aria-label', ARIA_LABELS.edit(task.title));
    editLink.append(createIcon('edit'));

    const deleteButton = createButton('', deleteTodoItem, ['btn-icon', 'btn-danger']);
    deleteButton.setAttribute('aria-label', ARIA_LABELS.delete(task.title));
    deleteButton.append(createIcon('trash'));

    taskItem.timer = createTimer(task.id, totalSeconds, isRunning, (seconds, running) => {
        timeValue.textContent = formatTime(seconds);
        dot.hidden = !running;
        taskItem.classList.toggle('is-running', running);
        renderTimerButton(timerButton, running, task.title);
        document.dispatchEvent(new Event(TASKS_CHANGED));
    });

    container.append(timeSlot, timerButton, editLink, deleteButton);
    return container;
}
```

**The row node is built in `dom-elements.js`, not in `render.js`.**

Before, `src/render.js`:

```js
export function addTodo(task, totalSeconds = 0, isRunning = false) {
    const taskTitle = createTitle(task.title);
    const { container, stopTimer, syncTimer } = createControls(task.id, totalSeconds, isRunning);
    const taskDomItem = createTaskItem(['task-item', 'row'], [taskTitle, container]);
    taskDomItem.stopTimer = stopTimer;
    taskDomItem.syncTimer = syncTimer;
    taskDomItem.setAttribute('item-id', task.id);
    taskTitle.addEventListener('click', () => {
        saveTaskId(task.id);
        window.location.href = './show.html';
    });
    if (task.done) {
        taskTitle.classList.add('done');
    }
    innerContainer.append(taskDomItem);
}
```

After, `src/render.js`:

```js
export function addTodo(task, totalSeconds = 0, isRunning = false) {
    innerContainer.append(createTaskItem(task, totalSeconds, isRunning));
}
```

After, `src/dom-elements.js`:

```js
export function createTaskItem(task, totalSeconds, isRunning) {
    const taskItem = createElement('div', ['task-item']);
    taskItem.setAttribute('item-id', task.id);

    const doneToggle = createDoneToggle(task.title);
    taskItem.setDone = (done) => {
        taskItem.classList.toggle('is-done', done);
        doneToggle.setAttribute('aria-pressed', String(done));
    };
    taskItem.setDone(task.done);

    const main = createElement('div', ['task-main']);
    main.append(doneToggle, createTaskLink(task.id, task.title, 'show.html', ['task-title']));

    taskItem.errorSlot = createElement('div', ['error-slot']);
    taskItem.append(main, createControls(taskItem, task, totalSeconds, isRunning), taskItem.errorSlot);
    return taskItem;
}
```

**Added to `src/render.js`:** `N running` and `Total`.

```js
function updateListSummary() {
    const rows = [...innerContainer.querySelectorAll('.task-item')];
    const running = rows.filter((row) => row.timer.isRunning()).length;
    runningCount.hidden = running === 0;
    runningLabel.textContent = `${running} running`;
    listTotal.hidden = rows.length === 0;
    listTotalValue.textContent = formatTime(rows.reduce((sum, row) => sum + row.timer.seconds(), 0));
}

document.addEventListener(TASKS_CHANGED, updateListSummary);
```

**The timer exposes its state for that summary.**

Before, `src/timer.js`:

```js
    return { toggle, sync, stop };
```

After:

```js
    return { toggle, sync, stop, seconds: () => seconds, isRunning: () => isRunning };
```

**Handlers: busy state and inline error instead of `alert()`.**

Before, `src/actions.js`:

```js
export async function toggleDoneStatus(event) {
    const taskItemEl = event.target.closest('.task-item');
    const taskId = taskItemEl.getAttribute('item-id');
    const titleEl = taskItemEl.querySelector('.task-tile');
    const nowDone = !titleEl.classList.contains('done');
    try {
        await updateTask(taskId, { done: nowDone });
        await taskItemEl.syncTimer();
        titleEl.classList.toggle('done', nowDone);
    } catch (err) {
        alert(err.message);
    }
}
```

After:

```js
export async function toggleDoneStatus(event) {
    const button = event.currentTarget;
    const taskItemEl = button.closest('[item-id]');
    const taskId = taskItemEl.getAttribute('item-id');
    const nowDone = !taskItemEl.classList.contains('is-done');
    clearInlineError(taskItemEl.errorSlot);
    setBusy(button, true);
    try {
        await updateTask(taskId, { done: nowDone });
        taskItemEl.setDone(nowDone);
        await taskItemEl.timer.sync();
    } catch (err) {
        showInlineError(taskItemEl.errorSlot, `${ALERTS.doneFailed} ${err.message}`);
        await readTimerAgain(taskItemEl);
    } finally {
        setBusy(button, false);
    }
}
```

**Added to `src/actions.js`:** the Start/Stop handler. It replaces the inline
handler in `createControls`.

```js
// The failure that brought us here is already on screen, so a second one adds nothing.
async function readTimerAgain(taskItemEl) {
    try {
        await taskItemEl.timer.sync();
    } catch {
        return;
    }
}

export async function toggleTimer(event) {
    const button = event.currentTarget;
    const taskItemEl = button.closest('[item-id]');
    const failure = taskItemEl.timer.isRunning() ? ALERTS.stopFailed : ALERTS.startFailed;
    clearInlineError(taskItemEl.errorSlot);
    setBusy(button, true);
    try {
        await taskItemEl.timer.toggle();
    } catch (err) {
        showInlineError(taskItemEl.errorSlot, `${failure} ${err.message}`);
        await readTimerAgain(taskItemEl);
    } finally {
        setBusy(button, false);
    }
}
```

**Deleted from `src/actions.js`:** edit is now a link.

```js
export function editTodoItem(event) {
    const domTaskItem = event.target.closest('.task-item');
    const taskId = domTaskItem.getAttribute('item-id');
    saveTaskId(taskId);
    window.location.href = './edit.html';
}
```

**Gold only marks a running Timer.**

Before, `style.css`:

```css
/* Highlight delete button with a subtle warning color */
.task-controls .btn:nth-child(3){
    background: #222;
    color: #f2c94c;
}
```

After:

```css
.task-item.is-running {
    background: color-mix(in srgb, var(--gold) 16%, var(--surface));
}

/* … */

.is-running .task-time {
    background: var(--gold);
}
```

**Docs, not in the working tree yet.** Add a new ADR to `architecture.md` that
supersedes the `alert()` half of ADR-005.

Before, `conventions.md`:

```markdown
- API failure → `try/catch` → `alert(err.message)` (ADR-005).
```

After:

```markdown
- API failure → `try/catch` → `showInlineError(slot, message)` (ADR-NNN).
```

Before, `conventions.md`:

```markdown
- Find a row's Task by `event.target.closest('.task-item')` and its `item-id` attribute.
```

After:

```markdown
- Find a Task's node by `event.currentTarget.closest('[item-id]')`: a list row or the show page.
```

**Check**

- [ ] Network set to Slow 3G, double-click Start: one `POST …/start`, no `409`.
- [ ] DevTools blocks `*/timer/stop`, click Stop: the message shows and the row keeps ticking.
- [ ] Mark a running Task done: `GET …/timer` gives `isRunning: false`.
- [ ] The gold token appears only in running-state selectors in `style.css`.
- [ ] T-4, T-5, T-6, T-10, T-12 pass.

### Step 4 — Delete on the row

**Changed:** `src/actions.js`, `src/dom-elements.js`, `src/constants.js`, `style.css`

**The tick stops only after `DELETE` succeeds (I-5).** A failed delete closes the
question and shows the error, and the row keeps ticking.

Before, `src/actions.js`:

```js
export async function deleteTodoItem(event) {
    const taskItemEl = event.target.closest('.task-item');
    if (!taskItemEl) return;
    const itemId = taskItemEl.getAttribute('item-id');
    taskItemEl.timer.stop();
    try {
        await deleteTask(itemId);
        taskItemEl.remove();
        document.dispatchEvent(new Event(TASKS_CHANGED));
    } catch (err) {
        alert(err.message);
    }
}
```

After:

```js
export async function deleteTodoItem(event) {
    const button = event.currentTarget;
    const taskItemEl = button.closest('[item-id]');
    clearInlineError(taskItemEl.errorSlot);
    setBusy(button, true);
    try {
        await deleteTask(taskItemEl.getAttribute('item-id'));
        taskItemEl.timer.stop();
        taskItemEl.afterDelete();
    } catch (err) {
        setBusy(button, false);
        taskItemEl.closeDeleteConfirm();
        showInlineError(taskItemEl.errorSlot, `${ALERTS.deleteFailed} ${err.message}`);
    }
}
```

**Added to `src/dom-elements.js`:** the inline question.

```js
// Hides the controls behind the question. Closing it returns focus to the delete icon.
function askDelete(event) {
    const trigger = event.currentTarget;
    const taskEl = trigger.closest('[item-id]');
    const controls = trigger.closest('.task-controls, .task-actions');
    const confirm = createElement('div', ['delete-confirm']);
    const cancel = createButton(BUTTON_TEXT.cancel, null, ['btn-ghost']);

    taskEl.closeDeleteConfirm = () => {
        confirm.remove();
        controls.hidden = false;
        trigger.focus();
    };
    cancel.onclick = taskEl.closeDeleteConfirm;

    confirm.append(
        createElement('span', ['delete-question'], PROMPTS.deleteTask),
        cancel,
        createButton(BUTTON_TEXT.delete, deleteTodoItem, ['btn-solid-danger'])
    );
    controls.hidden = true;
    controls.after(confirm);
    cancel.focus();
}
```

**The icon asks first.**

Before, `src/dom-elements.js`:

```js
    const deleteButton = createButton('', deleteTodoItem, ['btn-icon', 'btn-danger']);
```

After:

```js
    const deleteButton = createButton('', askDelete, ['btn-icon', 'btn-danger']);
```

**The row removes itself.** Step 6 sets a different `afterDelete` on show.

Before, `createTaskItem`:

```js
    taskItem.setAttribute('item-id', task.id);
```

After:

```js
    taskItem.setAttribute('item-id', task.id);
    taskItem.afterDelete = () => {
        taskItem.remove();
        document.dispatchEvent(new Event(TASKS_CHANGED));
    };
```

**New text.**

Before, `src/constants.js`:

```js
export const BUTTON_TEXT = {
    start: 'Start',
    stop: 'Stop',
};
```

After:

```js
export const BUTTON_TEXT = {
    start: 'Start',
    stop: 'Stop',
    cancel: 'Cancel',
    delete: 'Delete',
};
```

Added to `PROMPTS` and `ALERTS`:

```js
    deleteTask: 'Delete task and its time?',
```

```js
    deleteFailed: "Couldn't delete the task.",
```

**Added to `style.css`:**

```css
.delete-confirm {
    margin-left: auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
    font-size: 14px;
}
```

**Check**

- [ ] Cancel changes nothing.
- [ ] DevTools blocks `DELETE`, confirm: the message shows, the row stays and keeps ticking.
- [ ] T-7, T-11 pass.

### Step 5 — List states

**Changed:** `index.html`, `src/render.js`, `src/index.js`, `style.css`

**Heading, one New task link, three states. No floating button.**

Before, `index.html`:

```html
<main class="page-main">
    <a class="edit-task-btn btn" href="./add.html">add page</a>
    <div class="list-card">
```

After:

```html
<main class="page-main">
    <div class="page-head">
        <h1 class="page-title">Tasks</h1>
        <a class="new-task-link btn btn-primary" href="add.html">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"></path></svg>
            New task
        </a>
    </div>
    <div class="list-skeleton" aria-busy="true">
        <div class="skeleton-row"></div>
        <div class="skeleton-row"></div>
        <div class="skeleton-row"></div>
    </div>
    <div class="list-state list-failed" hidden>
        <h2 class="list-state-title">Can't load tasks</h2>
        <p class="list-failed-text"></p>
        <button type="button" class="btn btn-outline list-retry">Retry</button>
    </div>
    <div class="list-state list-empty" hidden>
        <h2 class="list-state-title">No tasks yet</h2>
        <p>Add one and start its timer.</p>
    </div>
    <div class="list-card" hidden>
```

Before, end of `index.html`:

```html
<script type="module" src="src/index.js"></script>
<button class="page-action-btn">add</button>
```

After:

```html
<script type="module" src="src/index.js"></script>
```

**A failed load shows the state instead of a blank page.**

Before, `src/render.js`:

```js
export async function renderTodoList() {
    innerContainer.innerHTML = '';
    const tasks = await getTasks();
    const timerTotals = await Promise.all(tasks.map((t) => getTimerTotal(t.id)));
    tasks.forEach((task, i) => {
        addTodo(task, timerTotals[i].totalSeconds, timerTotals[i].isRunning);
    });
    updateListSummary();
}
```

After:

```js
export async function renderTodoList() {
    showListState('loading');
    innerContainer.innerHTML = '';
    try {
        const tasks = await getTasks();
        const timerTotals = await Promise.all(tasks.map((t) => getTimerTotal(t.id)));
        tasks.forEach((task, i) => {
            addTodo(task, timerTotals[i].totalSeconds, timerTotals[i].isRunning);
        });
        updateListSummary();
    } catch (err) {
        failedText.textContent = err.message;
        showListState('failed');
    }
}
```

**Added to `src/render.js`:** the state switch.

```js
const pageHead = document.querySelector('.page-head');
const newTaskLink = document.querySelector('.new-task-link');
const failedText = document.querySelector('.list-failed-text');
const emptyState = document.querySelector('.list-empty');
const listStates = {
    loading: document.querySelector('.list-skeleton'),
    failed: document.querySelector('.list-failed'),
    empty: emptyState,
    list: document.querySelector('.list-card'),
};

function showListState(name) {
    Object.entries(listStates).forEach(([state, element]) => {
        element.hidden = state !== name;
    });
    // Moved, not hidden, so the page has one New task. Runs on every tick: moving it needlessly drops focus.
    const linkHome = name === 'empty' ? emptyState : pageHead;
    if (newTaskLink.parentElement !== linkHome) {
        linkHome.append(newTaskLink);
    }
}
```

**The last row deleted leads to the empty state.** Add as the last line of
`updateListSummary`:

```js
    showListState(rows.length === 0 ? 'empty' : 'list');
```

**Retry, no floating button.**

Before, `src/index.js`:

```js
import { renderTodoList } from './render.js';
import { initPageAction } from './action-button.js';

await renderTodoList();
initPageAction();
```

After:

```js
import { renderTodoList } from './render.js';

document.querySelector('.list-retry').addEventListener('click', renderTodoList);

await renderTodoList();
```

**Added to `style.css`:** the bottom bar on a phone (`A — Phone`), plus the
skeleton and state cards per `A — States`.

```css
@media (max-width: 599px) {
    .page-head .new-task-link {
        position: fixed;
        right: 12px;
        bottom: 12px;
        left: 12px;
        z-index: 1;
        min-height: 52px;
        box-shadow: 0 0 0 12px var(--page);
    }

    .page-main:not(.page-narrow) {
        padding-bottom: 88px;
    }
}
```

**Check**

- [ ] Network set to Slow 3G: the skeleton shows.
- [ ] Stop the API, reload: the error shows. Start it, Retry: the list shows.
- [ ] No tasks: the empty state shows.
- [ ] Delete the last Task: the empty state shows.
- [ ] `document.querySelectorAll('a[href*="add.html"]').length` is 1 in each state.

### Step 6 — Show page

**Changed:** `show.html`, `src/show.js`, `src/dom-elements.js`, `src/constants.js`, `style.css`

**No floating button.**

Before, `show.html`:

```html
<main class="content page-main page-narrow">
</main>
<footer class="site-footer">2025 alex@ukr.net</footer>
<script type="module" src="src/show.js"></script>
<button class="page-action-btn">edit</button>
```

After:

```html
<main class="page-main page-narrow">
</main>
<footer class="site-footer">2025 alex@ukr.net</footer>
<script type="module" src="src/show.js"></script>
```

**A failed load shows a message and a back link.**

Before, `src/show.js`:

```js
//show.js
import { getTaskId } from './data.js';
import { getTask, getTimerTotal } from './api-client.js';
import { taskShowDomElement } from './dom-elements.js';
import { initPageAction } from './action-button.js';

const taskId = getTaskId();

if (taskId) {
    const [task, timerData] = await Promise.all([getTask(taskId), getTimerTotal(taskId)]);

    if (task) {
        const element = taskShowDomElement(
            task.title,
            timerData.totalSeconds,
            task.done,
            task.description ?? ''
        );
        document.querySelector('.content').append(element);
    } else {
        console.error('Task not found');
    }
}

initPageAction();
```

After:

```js
//show.js
import { getTaskId } from './data.js';
import { getTask, getTimerTotal } from './api-client.js';
import { ALERTS } from './constants.js';
import { createBackLink, createTaskShow, renderLoadFailure } from './dom-elements.js';

const taskId = getTaskId();

try {
    if (!taskId) {
        throw new Error(ALERTS.noTask);
    }
    const [task, timerData] = await Promise.all([getTask(taskId), getTimerTotal(taskId)]);
    document
        .querySelector('.page-main')
        .append(createBackLink(), createTaskShow(task, timerData.totalSeconds, timerData.isRunning));
} catch (err) {
    renderLoadFailure(err.message);
}
```

**A list of labelled fields becomes the page from `A — Task`.** The node carries
`item-id`, `timer`, `errorSlot`, `setDone` and `afterDelete`, so the row's handlers
work here unchanged.

Before, `src/dom-elements.js`:

```js
export function taskShowDomElement(taskTitle, taskTime, taskStatus, taskDescription = '') {
    const container = document.createElement('div');
    container.classList.add('task-show');

    const statusText = taskStatus ? TASK_STATUS_TEXT.done : TASK_STATUS_TEXT.pending;
    const statusClass = taskStatus ? 'task-status-done' : 'task-status-pending';

    container.append(
        createTaskShowField(TASK_SHOW_LABELS.title, taskTitle, ['task-show-value-title']),
        createTaskShowField(TASK_SHOW_LABELS.time, `${taskTime}s`, ['task-show-value-time']),
        createTaskShowField(TASK_SHOW_LABELS.status, statusText, [
            'task-show-value-status',
            statusClass,
        ]),
        createTaskShowField(TASK_SHOW_LABELS.description, taskDescription || '—', [
            'task-show-value-description',
        ])
    );

    return container;
}
```

After (`createTaskShowField` is deleted too):

```js
export function createBackLink() {
    const link = createLink(BUTTON_TEXT.back, 'index.html', ['btn', 'btn-ghost', 'back-link']);
    link.prepend(createIcon('back'));
    return link;
}

export function renderLoadFailure(message) {
    const slot = createElement('div', ['error-slot']);
    document.querySelector('.page-main').append(createBackLink(), slot);
    showInlineError(slot, message);
}

export function createTaskShow(task, totalSeconds, isRunning) {
    const taskShow = createElement('div', ['task-show']);
    taskShow.setAttribute('item-id', task.id);
    taskShow.errorSlot = createElement('div', ['error-slot']);
    taskShow.afterDelete = () => {
        window.location.href = 'index.html';
    };

    const chip = createElement('span', ['status-chip']);
    const head = createElement('div', ['task-show-head']);
    head.append(createElement('h1', ['page-title'], task.title), chip);

    const renderChip = () => {
        const running = taskShow.classList.contains('is-running');
        chip.hidden = !running && !taskShow.classList.contains('is-done');
        chip.textContent = running ? TASK_STATUS_TEXT.running : TASK_STATUS_TEXT.done;
    };

    const doneButton = createButton('', toggleDoneStatus, ['btn-outline']);
    taskShow.setDone = (done) => {
        taskShow.classList.toggle('is-done', done);
        doneButton.textContent = done ? BUTTON_TEXT.reopen : BUTTON_TEXT.markDone;
        renderChip();
    };
    taskShow.setDone(task.done);

    const time = createElement('div', ['task-show-time']);
    time.setAttribute('role', 'timer');
    const timerButton = createButton('', toggleTimer, ['timer-btn']);
    taskShow.timer = createTimer(task.id, totalSeconds, isRunning, (seconds, running) => {
        time.textContent = formatTime(seconds);
        taskShow.classList.toggle('is-running', running);
        renderTimerButton(timerButton, running, task.title);
        renderChip();
    });

    const timeLabel = createElement('div', ['task-show-time-box']);
    timeLabel.append(createElement('h2', ['section-label'], TASK_SHOW_LABELS.time), time);
    const timerCard = createElement('section', ['task-show-timer']);
    timerCard.append(timeLabel, timerButton);

    const description = createElement('section', ['task-show-description']);
    description.append(
        createElement('h2', ['section-label'], TASK_SHOW_LABELS.description),
        createElement('p', [], task.description || '—')
    );

    const deleteButton = createButton(BUTTON_TEXT.delete, askDelete, ['btn-danger', 'task-show-delete']);
    deleteButton.prepend(createIcon('trash'));
    const actions = createElement('div', ['task-actions']);
    actions.append(
        doneButton,
        createTaskLink(task.id, BUTTON_TEXT.edit, 'edit.html', ['btn', 'btn-outline']),
        deleteButton
    );

    taskShow.append(head, timerCard, description, taskShow.errorSlot, actions);
    return taskShow;
}
```

**Text and icon.**

Before, `src/constants.js`:

```js
export const TASK_SHOW_LABELS = {
    title: 'Task title',
    time: 'Tracked time',
    status: 'Status',
    description: 'Description',
};

export const TASK_STATUS_TEXT = {
    done: 'Done',
    pending: 'In progress',
};
```

After:

```js
export const TASK_SHOW_LABELS = {
    time: 'Tracked time',
    description: 'Description',
};

export const TASK_STATUS_TEXT = {
    done: 'Done',
    running: 'Running',
};
```

Added to `BUTTON_TEXT`, `ICONS` and `ALERTS`:

```js
    edit: 'Edit',
    markDone: 'Mark done',
    reopen: 'Reopen',
    back: 'Tasks',
```

```js
    back: { size: 18, stroke: 2, paths: ['M15 5l-7 7 7 7'] },
```

```js
    noTask: 'No task selected.',
```

**`style.css`.** Delete `.task-show-field`, `.task-show-label`, `.task-show-value*`
and `.task-status-*`. Add the new classes per `A — Task`; the running ones use gold:

```css
.is-running .task-show-timer {
    background: color-mix(in srgb, var(--gold) 16%, var(--surface));
}

.is-running .status-chip {
    background: var(--gold);
}

.is-done:not(.is-running) .task-show-timer .timer-btn {
    display: none;
}
```

**Check**

- [ ] Start, reload: the time keeps counting.
- [ ] Mark a running Task done: it stops. Reopen: it does not resume.
- [ ] Delete the Task in another tab, reload: the message and back link show.

### Step 7 — Shared form

**Added:** `src/task-form.js`
**Deleted:** `src/action-button.js`
**Changed:** `add.html`, `edit.html`, `src/add.js`, `src/edit.js`, `src/validations.js`,
`src/dom-elements.js`, `src/constants.js`, `style.css`

**The form leaves the HTML.** `edit.html` is the same, and it also loses its `<h1>`.

Before, `add.html`:

```html
<main class="page-main page-narrow">
    <form class="form">
        <div class="form-field">
            <input type="text" class="title input" placeholder="enter task"/>
        </div>
        <div class="form-field">
            <textarea class="textarea-task textarea description"></textarea>
        </div>
        <div class="error-container row error">
        </div>
        <div class="row">
            <button class="add-task-btn btn">add</button>
        </div>
    </form>
</main>
<footer class="site-footer">2025 alex@ukr.net</footer>
<script type="module" src="src/add.js"></script>
<button class="page-action-btn">add</button>
```

After:

```html
<main class="page-main page-narrow">
</main>
<footer class="site-footer">2025 alex@ukr.net</footer>
<script type="module" src="src/add.js"></script>
```

**New file `src/task-form.js`:** the one form behind both pages.

```js
// task-form.js — the one form behind add.html and edit.html.
import { BUTTON_TEXT, FORM_TEXT, MAX_TASK_LENGTH } from './constants.js';
import { createBackLink, createButton, createElement, createLink } from './dom-elements.js';
import { setBusy } from './feedback.js';
import { displayError, taskValidation } from './validations.js';

function createField(labelText, control) {
    const field = createElement('div', ['form-field']);
    const label = createElement('label', ['form-label'], labelText);
    label.htmlFor = control.id;
    field.append(label, control);
    return field;
}

export function renderTaskForm({ heading, submitText, task, save }) {
    const title = createElement('input', ['input']);
    title.id = 'task-title';
    title.type = 'text';
    title.value = task?.title ?? '';
    title.setAttribute('aria-required', 'true');
    title.setAttribute('aria-describedby', 'task-title-help');

    const counter = createElement('span', ['title-counter']);
    const renderCounter = () => {
        counter.textContent = `${title.value.trim().length} / ${MAX_TASK_LENGTH}`;
    };
    title.addEventListener('input', renderCounter);
    renderCounter();

    const help = createElement('div', ['form-help']);
    help.id = 'task-title-help';
    help.append(createElement('div', ['error-container']), counter);

    const description = createElement('textarea', ['textarea']);
    description.id = 'task-description';
    description.value = task?.description ?? '';

    const submit = createButton(submitText, null, ['btn-primary']);
    submit.type = 'submit';
    const actions = createElement('div', ['form-actions']);
    actions.append(submit, createLink(BUTTON_TEXT.cancel, 'index.html', ['btn', 'btn-ghost']));

    const titleField = createField(FORM_TEXT.titleLabel, title);
    titleField.append(help);

    const form = createElement('form', ['form']);
    form.append(titleField, createField(FORM_TEXT.descriptionLabel, description), actions);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const valid = taskValidation(title.value);
        title.setAttribute('aria-invalid', String(!valid));
        if (!valid) {
            title.focus();
            return;
        }

        setBusy(submit, true);
        let failure = null;
        try {
            await save({ title: title.value, description: description.value });
        } catch (err) {
            failure = err;
        }
        // Before the focus below: setBusy returns focus to the submit button.
        setBusy(submit, false);

        if (failure) {
            displayError(failure.message);
            (failure.field === 'description' ? description : title).focus();
            return;
        }
        window.location.href = 'index.html';
    });

    document
        .querySelector('.page-main')
        .append(createBackLink(), createElement('h1', ['page-title'], heading), form);
}
```

**Added to `src/constants.js`:**

```js
export const FORM_TEXT = {
    titleLabel: 'Title',
    descriptionLabel: 'Description (optional)',
    add: { heading: 'New task', submitText: 'Create task' },
    edit: { heading: 'Edit task', submitText: 'Save changes' },
};
```

**Pages only wire the form.**

Before, `src/add.js`:

```js
//add.js
import { taskValidation } from './validations.js';
import { form, title, description } from './dom-elements.js';
import { createTask } from './api-client.js';
import { initPageAction } from './action-button.js';

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (taskValidation(title.value)) {
        try {
            await createTask(title.value, description.value);
            window.location.href = 'index.html';
        } catch (err) {
            alert(err.message);
        }
    }
});

initPageAction();
```

After:

```js
//add.js
import { createTask } from './api-client.js';
import { FORM_TEXT } from './constants.js';
import { renderTaskForm } from './task-form.js';

renderTaskForm({
    ...FORM_TEXT.add,
    save: ({ title, description }) => createTask(title, description),
});
```

Before, `src/edit.js`:

```js
//edit.js
import { getTaskId } from './data.js';
import { taskValidation } from './validations.js';
import { form, description, title } from './dom-elements.js';
import { getTask, updateTask } from './api-client.js';
import { initPageAction } from './action-button.js';

const taskId = getTaskId();

const task = taskId ? await getTask(taskId) : null;

if (task) {
    title.value = task.title;
    description.value = task.description ?? '';
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (taskValidation(title.value)) {
        try {
            await updateTask(taskId, { title: title.value, description: description.value });
            window.location.href = 'index.html';
        } catch (err) {
            alert(err.message);
        }
    }
});

initPageAction();
```

After:

```js
//edit.js
import { getTaskId } from './data.js';
import { getTask, updateTask } from './api-client.js';
import { ALERTS, FORM_TEXT } from './constants.js';
import { renderLoadFailure } from './dom-elements.js';
import { renderTaskForm } from './task-form.js';

const taskId = getTaskId();

try {
    if (!taskId) {
        throw new Error(ALERTS.noTask);
    }
    const task = await getTask(taskId);
    renderTaskForm({
        ...FORM_TEXT.edit,
        task,
        save: (fields) => updateTask(taskId, fields),
    });
} catch (err) {
    renderLoadFailure(err.message);
}
```

**`.error-container` is found when needed:** it no longer exists at import.

Before, `src/validations.js`:

```js
const errorContainer = document.querySelector('.error-container');

export function displayError(message) {
    errorContainer.textContent = message;
}
```

After:

```js
export function displayError(message) {
    document.querySelector('.error-container').textContent = message;
}
```

**Deleted from `src/dom-elements.js`:**

```js
export const form = document.querySelector('.form');
export const title = form?.querySelector('.title');
export const description = form?.querySelector('.description');
```

**Field styles: no gold, no `outline: none`.**

Before, `style.css`:

```css
.textarea,.input{
    width: 100%;
    padding: 10px;
    border: 1px solid black;
    margin-bottom: 20px;
    outline: none;
    font-size: 18px;
    border-radius: 5px;
}

.textarea,.input:focus{
    border: 1px solid gold;
    box-shadow: 0 0 5px gold;
}

.textarea,.input:hover{
    border: 1px solid gold;
    box-shadow: 0 0 5px gold;
    cursor: pointer;
}
```

After:

```css
.input, .textarea {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid var(--line-control);
    border-radius: 8px;
    background: var(--surface);
}

.input {
    height: 48px;
    font-size: 17px;
}

.input[aria-invalid='true'] {
    border-color: var(--danger);
}

.textarea {
    min-height: 140px;
    font-size: 16px;
    line-height: 1.5;
    resize: vertical;
}
```

**Deleted from `style.css`:** `.page-action-btn`, `.add-task-btn`, `.save-task-btn`,
`.row`, `.error`.

**Check**

- [ ] Blank title: the error shows in `.error-container` and focus is on the title.
- [ ] Enter submits.
- [ ] Stop the API, submit: the message shows in `.error-container` and submit is enabled again.
- [ ] Delete the Task in another tab, reload edit: the message and back link show.
- [ ] T-2, T-9, T-12 pass.

### Step 8 — Docs

**Changed:** `.ai/context/architecture.md`, `.ai/context/conventions.md`, `.ai/business/VALUE.md`

Before, `architecture.md` Layers:

```text
  handlers        src/actions.js · src/action-button.js         click → API → DOM
  timer display   src/timer.js                                  per-TaskItem tick, start/stop
```

After:

```text
  handlers        src/actions.js · src/task-form.js             click → API → DOM
  feedback        src/feedback.js                               busy state, inline errors
  timer display   src/timer.js                                  tick on list and show, start/stop
```

Before, `architecture.md` code map:

```markdown
| `TaskItem` | `render.addTodo()` + `dom-elements.createControls()`; `.stopTimer` property on the node |
```

After:

```markdown
| `TaskItem` | `render.addTodo()` + `dom-elements.createTaskItem()`; `.timer`, `.errorSlot`, `.setDone`, `.afterDelete` on the node |
```

Before, `architecture.md` Site Map:

```markdown
One row per HTML page; the docs page draws it as a tree (ADR-012). `Parent` follows
the breadcrumbs.
```

```markdown
| [`index.html`](../../index.html) | — | Task list: add, start / pause, done, delete | `add.html`, `show.html`, `edit.html` |
```

After (column names stay, `docs/config.js` reads them):

```markdown
One row per HTML page; the docs page draws it as a tree (ADR-012). `Parent` follows
the back link.
```

```markdown
| [`index.html`](../../index.html) | — | Task list: add, start / stop, done, delete | `add.html`, `show.html`, `edit.html` |
```

Before, `conventions.md`:

```markdown
  input rules → `validations.js` · HTTP → `api-client.js` only.
```

After:

```markdown
  input rules → `validations.js` · HTTP → `api-client.js` only ·
  busy state and inline errors → `feedback.js` · add and edit form → `task-form.js`.
```

Before, `VALUE.md`:

```markdown
   Start, pause and done sit in the same row as the title.
```

```markdown
| **User** (tracks their work) | Capture tasks fast; know how long each one really took | List page with add / start / pause / done / delete per row; server-computed totals |
```

```markdown
| **V-3** | Low friction | If tracking takes more effort than the work is worth, people stop tracking — and V-1 is never realised. | One-click controls per row, floating action button, short add form |
```

```markdown
| Start / pause a timer per task | **V-1**, V-3 | `Timer`, `TimeEntry` |
```

After:

```markdown
   Start, stop and done sit in the same row as the title.
```

```markdown
| **User** (tracks their work) | Capture tasks fast; know how long each one really took | List page with add / start / stop / done / delete per row; server-computed totals |
```

```markdown
| **V-3** | Low friction | If tracking takes more effort than the work is worth, people stop tracking — and V-1 is never realised. | One-click controls per row, short add form |
```

```markdown
| Start / stop a timer per task | **V-1**, V-3 | `Timer`, `TimeEntry` |
```

**Check**

- [ ] AC-3 above holds.
- [ ] `docs/index.html#sitemap` renders with no warning.

### Step 9 — Final pass and close-out

**Moved:** `TASK-020` and `TASK-021` from `.ai/backlog/` to `.ai/archive/`
**Changed:** `.ai/backlog/INDEX.md`, `.ai/archive/INDEX.md`

No new code: a check that fails sends you back to the step that owns that file.

Before, both tickets:

```markdown
| **Status** | `planned` |
```

After, with `## Outcome` filled in:

```markdown
| **Status** | `done` |
```

**Check**

- [ ] All four pages tabbed through: the focus ring is visible on every control, the header link included.
- [ ] Viewed at 360 px: `document.documentElement.scrollWidth` is at most 360.
- [ ] With reduced motion emulated, the dot and spinner do not animate.
- [ ] `npm run check` and T-1…T-12 pass, results pasted in the Outcome.

## Out of Scope

- What TASK-020 lists there.
- Backend changes: the server-side stop belongs to TASK-011.
- Renaming legacy names (`addTodo`, `deleteTodoItem`).
- `docs/index.html`: AC-12, AC-13 and AC-14 are read as the four task pages.
- Browser test tooling: it is a new dependency, raise it first.

## Notes

**Boards** are in the canvas linked from TASK-020, at `project/<file>`:

| Board | File |
| :--- | :--- |
| `A — Ledger` | `Main.dc.html` |
| `A — Phone` | `Phone.dc.html` |
| `A — Task` | `Show.dc.html` |
| `A — Form` | `Form.dc.html` |
| `A — States` | `States.dc.html` |

`B — Stopwatch` and `C — Focus` are rejected directions. Do not copy two mock-up
leftovers: the stray `Your text here` in `Main.dc.html`, and Delete on show drawn
as an `<a>`, which must be a `<button>`.

**Contrast** of the text colours on the boards was computed on 2026-11-05: the
lowest is 5.36:1 (done title on white). Only colours added later need a check.

**Decisions** where the boards or TASK-020 leave a gap or conflict:

| Decision | Choice | Trade-off | Recorded in |
| :--- | :--- | :--- | :--- |
| Shared form | Built in JS by `src/task-form.js` | Draws only after the module loads, but no duplicated markup; ADR-003 rules out build-time templates | here |
| Done control | `<button aria-pressed>` as on the boards, not `<input type="checkbox">`, which AC-12 would not allow | Box is drawn by hand | here |
| Where an error shows | Under the row that failed; above the actions on show | Row grows, but a banner over a long list would be off-screen on a phone | New ADR, step 3 |
| After save | Redirect to `index.html`; the `Saved` banner on `A — Form` is not built | No explicit confirmation; T-9 and the Site Map stay true | here |
| Empty list | The header link moves into the empty state, so it is the only New task | Link moves; AC-8 and AC-9 both hold as written | here |
| Focus ring on the header | White; the boards' `#111` ring is 1:1 on the `#111` header | One extra rule | `style.css` |
| Show or edit cannot load | Inline error and back link, also with no SelectedTask | Goes past TASK-020's ACs and no board draws it; without it the page stays blank once `alert()` goes | here |
| Title and edit as `<a>` | `saveTaskId` on `click` and `auxclick` | "Open in new tab" from the context menu still shows the previous SelectedTask until Q-3 | Q-3 |
| `src/feedback.js` | Leaf module for busy state and inline error | A second file creates DOM; putting them in `dom-elements.js` makes `timer.js` and `actions.js` import cycles | `conventions.md` |
