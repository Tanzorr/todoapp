// data.js
const STORAGE_KEY = 'taskStoreObject';
const TASK_ID = 'taskId';
export const taskStoreObject = loadFromStorage();
export const taskItem = {};

export function loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
}

export function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(taskStoreObject));
}

export function saveTaskId(id) {
    localStorage.setItem(TASK_ID, id);
}

export function getTaskId() {
    return localStorage.getItem(TASK_ID);
}

export function deleteItemFromStorage(id) {
    delete taskStoreObject[id];
    saveToStorage();
}

export function getTaskById(id) {
    return taskStoreObject[id];
}
