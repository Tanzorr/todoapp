//edit.js
import { getTaskId } from './data.js';
import { taskValidation } from './validations.js';
import { form, description, title } from './dom-elements.js';
import { getTask, updateTask } from './api-client.js';
import { initPageAction } from './action-button.js';
import { initAccount } from './account.js';

initAccount();

const taskId = getTaskId();

const task = taskId ? await getTask(taskId) : null;

if (task) {
    title.value = task.title;
    description.value = task.description ?? '';
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (taskValidation(title.value)) {
        try {
            await updateTask(taskId, { title: title.value, description: description.value });
            window.location.href = 'index.html';
        } catch (err) {
            alert(err.message);
        }
    }
});

initPageAction();
