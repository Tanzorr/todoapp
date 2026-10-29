import { saveTaskId } from './data.js';
import { deleteTask, updateTask } from './api-client.js';

export async function deleteTodoItem(event) {
    const taskItemEl = event.target.closest('.task-item');
    if (!taskItemEl) return;
    const itemId = taskItemEl.getAttribute('item-id');
    taskItemEl.stopTimer?.();
    try {
        await deleteTask(itemId);
        taskItemEl.remove();
    } catch (err) {
        alert(err.message);
    }
}

export function editTodoItem(event) {
    const domTaskItem = event.target.closest('.task-item');
    const taskId = domTaskItem.getAttribute('item-id');
    saveTaskId(taskId);
    window.location.href = './edit.html';
}

export async function toggleDoneStatus(event) {
    const taskItemEl = event.target.closest('.task-item');
    const taskId = taskItemEl.getAttribute('item-id');
    const titleEl = taskItemEl.querySelector('.task-tile');
    const nowDone = !titleEl.classList.contains('done');
    try {
        await updateTask(taskId, { done: nowDone });
        taskItemEl.stopTimer?.();
        titleEl.classList.toggle('done', nowDone);
    } catch (err) {
        alert(err.message);
    }
}
