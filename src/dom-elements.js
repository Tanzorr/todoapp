//dom-elements.js
import { createTimer } from './timer.js';
import {
    BUTTON_TEXT,
    DEFAULT_TIMER_VALUE,
    TASK_SHOW_LABELS,
    TASK_STATUS_TEXT,
} from './constants.js';
import { deleteTodoItem, editTodoItem, toggleDoneStatus } from './actions.js';

export const form = document.querySelector('.form');
export const title = form?.querySelector('.title');
export const description = form?.querySelector('.description');


export function createTaskItem(extraClasses, innerElements) {
    const taskItem = document.createElement('div');
    taskItem.classList.add(...extraClasses);
    innerElements.forEach((element) => taskItem.append(element));

    return taskItem;
}

export function createButton(text, handler) {
    const btn = document.createElement('button');
    btn.classList.add('btn');
    btn.textContent = text;

    if (handler) {
        btn.onclick = handler;
    }

    return btn;
}

// 🔹 title
export function createTitle(text) {
    const div = document.createElement('div');
    div.classList.add('task-tile');
    div.textContent = text;
    return div;
}

export function createControls(taskId, workingTime = 0) {
    const { handleTimer, stop } = createTimer(taskId);
    const container = document.createElement('div');
    container.classList.add('task-controls');

    const editButton = createButton(BUTTON_TEXT.edit, editTodoItem);
    const doneButton = createButton(BUTTON_TEXT.done, toggleDoneStatus);
    const deleteButton = createButton(BUTTON_TEXT.delete, deleteTodoItem);

    const timerButton = createButton(`${workingTime ?? DEFAULT_TIMER_VALUE}s`);

    const controlButton = createButton(BUTTON_TEXT.start, () => {
        handleTimer(timerButton, controlButton);
    });

    container.append(editButton, doneButton, deleteButton, controlButton, timerButton);

    return { container, stopTimer: stop };
}

export function createLink(text, href, classes) {
    const link = document.createElement('a');
    link.classList.add(...classes);
    link.textContent = text;
    link.href = href;
    return link;
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
        createTaskShowField(TASK_SHOW_LABELS.status, statusText, ['task-show-value-status', statusClass]),
        createTaskShowField(TASK_SHOW_LABELS.description, taskDescription || '—', ['task-show-value-description'])
    );

    return container;
}
