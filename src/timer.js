//timer.js
import { BUTTON_TEXT } from './constants.js';
import {getTaskById, saveToStorage, taskStoreObject} from "./data.js";

export function createTimer(taskId) {
    let counter = getTaskById(taskId)?.workingTime ?? 0;
    let isRunning = false;
    let intervalId = null;

    function stop() {
        clearInterval(intervalId);
        isRunning = false;
    }

    function handleTimer(timerButton, controlButton) {
        if (isRunning) {
            stop();
            controlButton.textContent = BUTTON_TEXT.start;
        } else {
            isRunning = true;
            intervalId = setInterval(() => {
                counter += 1;
                timerButton.textContent = `${counter} s`;
                taskStoreObject[taskId].workingTime = counter;
                saveToStorage();
            }, 1000);
            controlButton.textContent = BUTTON_TEXT.pause;
        }
    }

    return { handleTimer, stop };
}
