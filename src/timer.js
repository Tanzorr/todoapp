//timer.js
import { BUTTON_TEXT } from './constants.js';

export function createTimer() {
    let counter = 0;
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
            }, 1000);
            controlButton.textContent = BUTTON_TEXT.pause;
        }
    }

    return { handleTimer, stop };
}
