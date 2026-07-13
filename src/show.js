//show.js
import {getTaskId, taskStoreObject} from "./data.js";
import {taskShowDomElement} from "./dom-elements.js";
import { initPageAction } from './action-button.js';

const taskId = getTaskId();
const task = taskStoreObject[taskId];

if (task) {
    const taskTitleDomElement = taskShowDomElement(task.title, task.workingTime, task.isDone, task.description)
    document.querySelector('.content').append(taskTitleDomElement);
} else {
    console.error('Task not found');
}

// Wire the floating action button (edit navigation)
initPageAction();


