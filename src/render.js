//render.js
import { saveTaskId } from './data.js';
import { getTasks, getTimerTotal } from './api-client.js';
import { createControls, createTaskItem, createTitle } from './dom-elements.js';

export const innerContainer = document.querySelector('.items-container');

export async function renderTodoList() {
    innerContainer.innerHTML = '';
    const tasks = await getTasks();
    const timerTotals = await Promise.all(tasks.map((t) => getTimerTotal(t.id)));
    tasks.forEach((task, i) => {
        addTodo(task, timerTotals[i].totalSeconds, timerTotals[i].isRunning);
    });
}

export function addTodo(task, totalSeconds = 0, isRunning = false) {
    const taskTitle = createTitle(task.title);
    const { container, stopTimer } = createControls(task.id, totalSeconds, isRunning);
    const taskDomItem = createTaskItem(['task-item', 'row'], [taskTitle, container]);
    taskDomItem.stopTimer = stopTimer;
    taskDomItem.setAttribute('item-id', task.id);
    taskTitle.addEventListener('click', () => {
        saveTaskId(task.id);
        window.location.href = './show.html';
    });
    if (task.done) {
        taskTitle.classList.add('done');
    }
    innerContainer.append(taskDomItem);
}
