// data.js — navigation helpers only; task data lives in MySQL via the backend API
const TASK_ID = 'taskId';

export function saveTaskId(id) {
    localStorage.setItem(TASK_ID, id);
}

export function getTaskId() {
    return localStorage.getItem(TASK_ID);
}
