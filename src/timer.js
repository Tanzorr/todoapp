//timer.js
import { BUTTON_TEXT } from './constants.js';
import { startTimer, stopTimer, getTimerTotal } from './api-client.js';

export function createTimer(taskId, initialSeconds = 0, initiallyRunning = false) {
    let counter = initialSeconds;
    let isRunning = false;
    let intervalId = null;

    function startDisplay(timerButton) {
        isRunning = true;
        intervalId = setInterval(() => {
            counter += 1;
            timerButton.textContent = `${counter} s`;
        }, 1000);
    }

    function stop() {
        clearInterval(intervalId);
        isRunning = false;
    }

    async function handleTimer(timerButton, controlButton) {
        if (isRunning) {
            stop();
            controlButton.textContent = BUTTON_TEXT.start;
            try {
                await stopTimer(taskId);
                const total = await getTimerTotal(taskId);
                counter = total.totalSeconds;
                timerButton.textContent = `${counter} s`;
            } catch (err) {
                alert(err.message);
            }
        } else {
            try {
                await startTimer(taskId);
                startDisplay(timerButton);
                controlButton.textContent = BUTTON_TEXT.pause;
            } catch (err) {
                alert(err.message);
            }
        }
    }

    // If timer was already running when page loaded, start local display
    if (initiallyRunning) {
        // delay to allow timerButton reference to exist — started by createControls
        setTimeout(() => {
            isRunning = true;
        }, 0);
    }

    return { handleTimer, stop, isRunning: () => isRunning };
}
