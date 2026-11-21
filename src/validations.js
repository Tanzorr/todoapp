import { MAX_TASK_LENGTH, ALERTS } from './constants.js';

const errorContainer = document.querySelector('.error-container');

export function displayError(message) {
    errorContainer.textContent = message;
}

export function taskValidation(taskString) {
    const length = taskString.trim().length;
    switch (true) {
        case length === 0:
            displayError(ALERTS.emptyTask);
            return false;
        case length > MAX_TASK_LENGTH:
            displayError(ALERTS.maxLength);
            return false;
        default:
            displayError('');
            return true;
    }
}
