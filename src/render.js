//render.js
import { taskStoreObject } from './data.js';
import { createControls, createTaskItem, createTitle } from './dom-elements.js';

export const innerContainer = document.querySelector('.items-container');

export function renderTodoList() {
    innerContainer.innerHTML = ''; // Clear the container before rendering
    Object.values(taskStoreObject).forEach(function (taskItem) {
        addTodo(taskItem);
    });
}

export function addTodo(taskItem) {
    //  1 Create the main container
    const taskTitle = createTitle(taskItem.title);
    const { container, stopTimer } = createControls();
    const taskDomItem = createTaskItem(['task-item', 'row'], [taskTitle, container]);
    taskDomItem.stopTimer = stopTimer;
    taskDomItem.setAttribute('item-id', taskItem.id);
    innerContainer.append(taskDomItem);
}

// 🔹 buttons and timer
