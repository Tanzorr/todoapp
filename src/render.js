//render.js
import { getTasks, getTimerTotal } from './api-client.js';
import { TASKS_CHANGED } from './constants.js';
import { createTaskItem } from './dom-elements.js';
import { formatTime } from './timer.js';

export const innerContainer = document.querySelector('.items-container');
const runningCount = document.querySelector('.running-count');
const runningLabel = document.querySelector('.running-label');
const listTotal = document.querySelector('.list-total');
const listTotalValue = document.querySelector('.list-total-value');

function updateListSummary() {
    const rows = [...innerContainer.querySelectorAll('.task-item')];
    const running = rows.filter((row) => row.timer.isRunning()).length;
    runningCount.hidden = running === 0;
    runningLabel.textContent = `${running} running`;
    listTotal.hidden = rows.length === 0;
    listTotalValue.textContent = formatTime(
        rows.reduce((sum, row) => sum + row.timer.seconds(), 0)
    );
}

document.addEventListener(TASKS_CHANGED, updateListSummary);

export async function renderTodoList() {
    innerContainer.innerHTML = '';
    const tasks = await getTasks();
    const timerTotals = await Promise.all(tasks.map((t) => getTimerTotal(t.id)));
    tasks.forEach((task, i) => {
        addTodo(task, timerTotals[i].totalSeconds, timerTotals[i].isRunning);
    });
    updateListSummary();
}

export function addTodo(task, totalSeconds = 0, isRunning = false) {
    innerContainer.append(createTaskItem(task, totalSeconds, isRunning));
}
