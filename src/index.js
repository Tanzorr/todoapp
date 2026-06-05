import { taskStoreObject } from './data.js';
import { taskValidation } from './validations.js';
import { renderTodoList } from './render.js';
import { form, taskInput, editButton } from './dom-elements.js';
import { saveAfterEditTodoItem, createTaskItem } from './actions.js';

renderTodoList();

form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (taskValidation(taskInput.value, Object.values(taskStoreObject))) {
        const taskItem = createTaskItem(taskInput.value);
        taskStoreObject[taskItem.id] = taskItem;
        renderTodoList();
        taskInput.value = '';
    }
});

editButton.addEventListener('click', saveAfterEditTodoItem);
