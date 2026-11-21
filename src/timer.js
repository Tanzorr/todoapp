//timer.js
import { startTimer, stopTimer, getTimerTotal } from './api-client.js';

export function formatTime(totalSeconds) {
    const parts = [
        Math.floor(totalSeconds / 3600),
        Math.floor((totalSeconds % 3600) / 60),
        totalSeconds % 60,
    ];
    return parts.map((part) => String(part).padStart(2, '0')).join(':');
}

export function createTimer(taskId, initialSeconds, initiallyRunning, render) {
    let seconds = initialSeconds;
    let isRunning = false;
    let intervalId = null;

    function stop() {
        clearInterval(intervalId);
        isRunning = false;
    }

    function show(totalSeconds, running) {
        stop();
        seconds = totalSeconds;
        if (running) {
            isRunning = true;
            intervalId = setInterval(() => {
                seconds += 1;
                render(seconds, isRunning);
            }, 1000);
        }
        render(seconds, isRunning);
    }

    async function sync() {
        const total = await getTimerTotal(taskId);
        show(total.totalSeconds, total.isRunning);
    }

    async function toggle() {
        await (isRunning ? stopTimer(taskId) : startTimer(taskId));
        await sync();
    }

    show(initialSeconds, initiallyRunning);

    return { toggle, sync, stop, seconds: () => seconds, isRunning: () => isRunning };
}
