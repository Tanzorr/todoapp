//edit.js
import { getTaskId } from './data.js';
import { description, title } from './dom-elements.js';
import { getTask, updateTask } from './api-client.js';
import { initPageAction } from './action-button.js';

const taskId = getTaskId();
const saveButton = document.querySelector('.save-task-btn');

const task = taskId ? await getTask(taskId) : null;

if (task) {
    title.value = task.title;
    description.value = task.description ?? '';
}

saveButton.addEventListener('click', async (event) => {
    event.preventDefault();
    try {
        await updateTask(taskId, { title: title.value, description: description.value });
        window.location.href = 'index.html';
    } catch (err) {
        alert(err.message);
    }
});

initPageAction();
