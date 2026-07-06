//edit.js
import {getTaskId, saveToStorage, taskStoreObject} from "./data.js";
import {description, title} from "./dom-elements.js";

const taskId = getTaskId();
const task = taskStoreObject[taskId];
// const editTitleInput = document.querySelector('.input-task'); we don't need this because we already have title and description imported from dom-elements.js
// const editDescriptionInput = document.querySelector('.input-description');
const saveButton = document.querySelector('.save-task-btn');

if (task) {
    title.value = task.title;
    description.value = task.description;
}

saveButton.addEventListener('click', (event) => {
    event.preventDefault();
    task.title = title.value;
    task.description = description.value;
    saveToStorage();
    window.location.href = 'index.html';
});




