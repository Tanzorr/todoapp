//edit.js
import {getTaskId, saveToStorage, taskStoreObject} from "./data.js";

const taskId = getTaskId();
const task = taskStoreObject[taskId];
const editTitleInput = document.querySelector('.input-task');
const saveButton = document.querySelector('.save-task-btn');

if (task) {
    editTitleInput.value = task.title;
}

saveButton.addEventListener('click', (event) => {
    event.preventDefault();
    task.title = editTitleInput.value;
    saveToStorage();
    window.location.href = 'index.html';
});




