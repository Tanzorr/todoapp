//add.js
import { taskValidation } from './validations.js';
import { form, title, description } from './dom-elements.js';
import { createTask } from './api-client.js';
import { initPageAction } from './action-button.js';

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (taskValidation(title?.value, [])) {
        try {
            await createTask(title.value, description.value);
            window.location.href = 'index.html';
        } catch (err) {
            alert(err.message);
        }
    }
});

initPageAction();
