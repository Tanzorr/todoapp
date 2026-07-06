//add.js
import {saveToStorage, taskStoreObject} from './data.js';
import { taskValidation } from './validations.js';
import { form, title,description } from './dom-elements.js';
import { createTaskData } from './actions.js';


form.addEventListener('submit', (e) => {
    e.preventDefault();

    const existingTitles = Object.values(taskStoreObject).map((task) => task.title);
    if (taskValidation(title?.value, existingTitles)) {
        const taskItem = createTaskData(title.value, description.value);
        taskStoreObject[taskItem.id] = taskItem;
        title.value = '';
        description.value = ''
        saveToStorage();
        window.location.href = 'index.html';
    }
});

