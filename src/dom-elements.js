//dom-elements.js
import { createTimer } from './timer.js';
import { BUTTON_TEXT, DEFAULT_TIMER_VALUE } from './constants.js';
import { deleteTodoItem, editTodoItem, toggleDoneStatus } from './actions.js';

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

export function createControls() {
    const { handleTimer, stop } = createTimer();
    const container = document.createElement('div');
    container.classList.add('task-controls');

    const editButton = createButton(BUTTON_TEXT.edit, editTodoItem);
    const doneButton = createButton(BUTTON_TEXT.done, toggleDoneStatus);
    const deleteButton = createButton(BUTTON_TEXT.delete, deleteTodoItem);

    const timerButton = createButton(`${DEFAULT_TIMER_VALUE}s`);

    const controlButton = createButton(BUTTON_TEXT.start, () => {
        handleTimer(timerButton, controlButton);
    });

    container.append(editButton, doneButton, deleteButton, controlButton, timerButton);

    return { container, stopTimer: stop };
}
