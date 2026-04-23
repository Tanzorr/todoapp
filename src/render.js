//render.js
import { taskStoreArray } from './data.js';
import { createControls, createTaskItem, createTitle } from './dom-elements.js';

export const innerContainer = document.querySelector('.items-container');

export function renderTodoList() {
    innerContainer.innerHTML = ''; // Clear the container before rendering
    taskStoreArray.forEach(function (taskText) {
        addTodo(taskText);
    });
}

export function addTodo(textContent) {
    //  1 Create the main container
    const taskTitle = createTitle(textContent);
    const { container, stopTimer } = createControls();
    const taskItem = createTaskItem(['task-item', 'row'], [taskTitle, container]);
    taskItem.stopTimer = stopTimer;
    innerContainer.append(taskItem);
}

// 🔹 buttons and timer
