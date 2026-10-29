// api-client.js
const BASE_URL = 'http://localhost:3000/api';

async function apiFetch(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'API error');
    return data;
}

export async function getTasks() {
    return apiFetch('/tasks');
}

export async function getTask(id) {
    return apiFetch(`/tasks/${id}`);
}

export async function createTask(title, description) {
    return apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({ title, description }),
    });
}

export async function updateTask(id, fields) {
    return apiFetch(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(fields),
    });
}

export async function deleteTask(id) {
    return apiFetch(`/tasks/${id}`, { method: 'DELETE' });
}

export async function startTimer(taskId) {
    return apiFetch(`/tasks/${taskId}/timer/start`, { method: 'POST' });
}

export async function stopTimer(taskId) {
    return apiFetch(`/tasks/${taskId}/timer/stop`, { method: 'POST' });
}

export async function getTimerTotal(taskId) {
    return apiFetch(`/tasks/${taskId}/timer`);
}

