//add.js
import {saveToStorage, taskStoreObject} from './data.js';
import { taskValidation } from './validations.js';
import { form, taskInput, } from './dom-elements.js';
import { createTaskData } from './actions.js';


form.addEventListener('submit', (e) => {
    e.preventDefault();
    const existingTitles = Object.values(taskStoreObject).map((task) => task.title);
    if (taskValidation(taskInput.value, existingTitles)) {
        const taskItem = createTaskData(taskInput.value);
        taskStoreObject[taskItem.id] = taskItem;
        taskInput.value = '';
        saveToStorage();
        window.location.href = 'index.html';
    }
});

