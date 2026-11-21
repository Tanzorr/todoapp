//dom-elements.js
import { createTimer, formatTime } from './timer.js';
import { saveTaskId } from './data.js';
import { createIcon } from './feedback.js';
import {
    ARIA_LABELS,
    BUTTON_TEXT,
    TASKS_CHANGED,
    TASK_SHOW_LABELS,
    TASK_STATUS_TEXT,
} from './constants.js';
import { deleteTodoItem, toggleDoneStatus, toggleTimer } from './actions.js';

export const form = document.querySelector('.form');
export const title = form?.querySelector('.title');
export const description = form?.querySelector('.description');

export function createElement(tag, classes = [], text = '') {
    const element = document.createElement(tag);
    element.classList.add(...classes);
    element.textContent = text;
    return element;
}

export function createButton(text, handler, classes = []) {
    const btn = createElement('button', ['btn', ...classes], text);
    btn.type = 'button';

    if (handler) {
        btn.onclick = handler;
    }

    return btn;
}

export function createLink(text, href, classes) {
    const link = createElement('a', classes, text);
    link.href = href;
    return link;
}

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
    taskItem.append(
        main,
        createControls(taskItem, task, totalSeconds, isRunning),
        taskItem.errorSlot
    );
    return taskItem;
}

function createTaskShowField(labelText, valueText, valueClasses = []) {
    const field = document.createElement('div');
    field.classList.add('task-show-field');

    const label = document.createElement('span');
    label.classList.add('task-show-label');
    label.textContent = `${labelText}:`;

    const value = document.createElement('span');
    value.classList.add('task-show-value', ...valueClasses);
    value.textContent = valueText;

    field.append(label, value);

    return field;
}

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
