import { taskItem, taskStoreObject } from './data.js';
import { taskInput } from './dom-elements.js';
import { renderTodoList } from './render.js';

export function deleteTodoItem(event) {
    const taskItem = event.target.closest('.task-item');
    if (taskItem) {
        const taskTitle = taskItem.querySelector('.task-tile');
        taskItem.remove();
        taskItem.stopTimer();
        const index = taskStoreObject.indexOf(taskTitle.textContent);
        if (index > -1) {
            taskStoreObject.splice(index, 1);
        }
    }
}

export function editTodoItem(event) {
    const domTaskItem = event.target.closest('.task-item');
    const taskTitle = domTaskItem.querySelector('.task-tile');

    taskInput.value = taskTitle.textContent;
    taskItem.id = domTaskItem.getAttribute('item-id');
}

export function saveAfterEditTodoItem() {
    taskStoreObject[taskItem.id].title = taskInput.value;
    renderTodoList();
    taskInput.value = '';
}
export function toggleDoneStatus(event) {
    const taskItem = event.target.closest('.task-item');
    const taskTitle = taskItem.querySelector('.task-tile');

    if (taskTitle.classList.contains('done')) {
        taskTitle.classList.remove('done');
    } else {
        taskTitle.classList.add('done');
    }
}

export function createTaskItem(taskTitle) {
    return {
        id: new Date().getTime(),
        title: taskTitle,
        isDone: false,
        workingTime: 0,
    };
}
