import {deleteItemFromStorage, saveTaskId, saveToStorage, taskItem, taskStoreObject} from './data.js';
import {renderTodoList} from "./render.js";


export function deleteTodoItem(event) {
    const taskItem = event.target.closest('.task-item');
    if (taskItem) {
        const itemId = taskItem.getAttribute('item-id');
        deleteItemFromStorage(itemId);
        taskItem.stopTimer?.()
        taskItem.remove();
        taskItem.stopTimer();
    }
}

export function editTodoItem(event) {
    const domTaskItem = event.target.closest('.task-item');
    const taskId = domTaskItem.getAttribute('item-id');
    saveTaskId(taskId);
    window.location.href = './edit.html';
}

export function toggleDoneStatus(event) {
     const taskItem = event.target.closest('.task-item');
     const taskId = taskItem.getAttribute('item-id');
     taskStoreObject[taskId].isDone = !taskStoreObject[taskId].isDone;
     taskItem.stopTimer();
     saveToStorage();
     renderTodoList();
}

export function createTaskData(title, description='') {
    return {
        id: new Date().getTime(),
        title: title,
        description: description,
        isDone: false,
        workingTime: 0,
    };
}
