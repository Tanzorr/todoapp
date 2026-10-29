//show.js
import { getTaskId } from './data.js';
import { getTask, getTimerTotal } from './api-client.js';
import { taskShowDomElement } from './dom-elements.js';
import { initPageAction } from './action-button.js';

const taskId = getTaskId();

if (taskId) {
    const [task, timerData] = await Promise.all([getTask(taskId), getTimerTotal(taskId)]);

    if (task) {
        const element = taskShowDomElement(
            task.title,
            timerData.totalSeconds,
            task.done,
            task.description ?? ''
        );
        document.querySelector('.content').append(element);
    } else {
        console.error('Task not found');
    }
}

initPageAction();
