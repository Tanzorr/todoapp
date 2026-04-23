import { MIN_TASK_LENGTH, MAX_TASK_LENGTH, ALERTS } from './constants.js';

export function taskValidation(taskString, taskStoreArray) {
    switch (true) {
        case taskString === null:
            return false;
        case taskStoreArray.includes(taskString):
            alert(ALERTS.taskExists);
            return false;
        case taskString.trim() === '':
            alert(ALERTS.emptyTask);
            return false;
        case taskString.length < MIN_TASK_LENGTH:
            alert(ALERTS.minLength);
            return false;
        case taskString.length > MAX_TASK_LENGTH:
            alert(ALERTS.maxLength);
            return false;
        default:
            return true;
    }
}
