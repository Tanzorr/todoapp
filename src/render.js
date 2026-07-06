//render.js
import {loadFromStorage, saveTaskId,  taskStoreObject} from './data.js';
import {createControls, createTaskItem, createLink, createTitle} from './dom-elements.js';

export const innerContainer = document.querySelector('.items-container');

export function renderTodoList() {
    innerContainer.innerHTML = ''; // Clear the container before rendering
    Object.values(loadFromStorage()).forEach(function (taskItem) {
        addTodo(taskItem);
    });
}

export function addTodo(taskItem) {
    //  1 Create the main container
    const taskTitle = createTitle(taskItem.title);
    const { container, stopTimer } = createControls(taskItem.id, taskItem.workingTime);
    const taskDomItem = createTaskItem(['task-item', 'row'], [taskTitle, container]);
    taskDomItem.stopTimer = stopTimer;
    taskDomItem.setAttribute('item-id', taskItem.id);
    taskTitle.addEventListener('click', () => {
        window.location.href = './show.html';
        saveTaskId(taskItem.id);
    });
    if(taskItem.isDone) {
        taskTitle.classList.add('done');
    }
    innerContainer.append(taskDomItem);
}

// 🔹 buttons and timer
