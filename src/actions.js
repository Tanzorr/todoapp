import { deleteTask, updateTask } from './api-client.js';
import { ALERTS, TASKS_CHANGED } from './constants.js';
import { clearInlineError, setBusy, showInlineError } from './feedback.js';

export async function deleteTodoItem(event) {
    const taskItemEl = event.target.closest('.task-item');
    if (!taskItemEl) return;
    const itemId = taskItemEl.getAttribute('item-id');
    taskItemEl.timer.stop();
    try {
        await deleteTask(itemId);
        taskItemEl.remove();
        document.dispatchEvent(new Event(TASKS_CHANGED));
    } catch (err) {
        alert(err.message);
    }
}

// The failure that brought us here is already on screen, so a second one adds nothing.
async function readTimerAgain(taskItemEl) {
    try {
        await taskItemEl.timer.sync();
    } catch {
        return;
    }
}

export async function toggleTimer(event) {
    const button = event.currentTarget;
    const taskItemEl = button.closest('[item-id]');
    const failure = taskItemEl.timer.isRunning() ? ALERTS.stopFailed : ALERTS.startFailed;
    clearInlineError(taskItemEl.errorSlot);
    setBusy(button, true);
    try {
        await taskItemEl.timer.toggle();
    } catch (err) {
        showInlineError(taskItemEl.errorSlot, `${failure} ${err.message}`);
        await readTimerAgain(taskItemEl);
    } finally {
        setBusy(button, false);
    }
}

export async function toggleDoneStatus(event) {
    const button = event.currentTarget;
    const taskItemEl = button.closest('[item-id]');
    const taskId = taskItemEl.getAttribute('item-id');
    const nowDone = !taskItemEl.classList.contains('is-done');
    clearInlineError(taskItemEl.errorSlot);
    setBusy(button, true);
    try {
        await updateTask(taskId, { done: nowDone });
        taskItemEl.setDone(nowDone);
        await taskItemEl.timer.sync();
    } catch (err) {
        showInlineError(taskItemEl.errorSlot, `${ALERTS.doneFailed} ${err.message}`);
        await readTimerAgain(taskItemEl);
    } finally {
        setBusy(button, false);
    }
}
