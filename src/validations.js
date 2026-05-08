import { MIN_TASK_LENGTH, MAX_TASK_LENGTH, ALERTS } from './constants.js';

const errorContainer = document.querySelector('.error-container');

export function displayError(message) {
    errorContainer.textContent = message;
}

export function taskValidation(taskString, taskStoreArray) {
    switch (true) {
        case taskString === null:
            return false;
        case taskStoreArray.includes(taskString):
            displayError(ALERTS.taskExists);
            return false;
        case taskString.trim() === '':
            displayError(ALERTS.emptyTask);
            return false;
        case taskString.length < MIN_TASK_LENGTH:
            displayError(ALERTS.minLength);
            return false;
        case taskString.length > MAX_TASK_LENGTH:
            displayError(ALERTS.maxLength);
            return false;
        default:
            displayError('');
            return true;
    }
}
