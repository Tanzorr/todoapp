import { PROMPTS } from './constants.js';
import { taskStoreArray } from './data.js';

export function deleteTodoItem(event) {
    const taskItem = event.target.closest('.task-item');
    if (taskItem) {
        const taskTitle = taskItem.querySelector('.task-tile');
        taskItem.remove();
        taskItem.stopTimer();
        const index = taskStoreArray.indexOf(taskTitle.textContent);
        if (index > -1) {
            taskStoreArray.splice(index, 1);
        }
    }
}

export function editTodoItem(event) {
    const taskItem = event.target.closest('.task-item');
    const taskTitle = taskItem.querySelector('.task-tile');
    const currentValue = taskTitle.textContent;

    taskTitle.textContent = window.prompt(PROMPTS.editTask, currentValue);
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
