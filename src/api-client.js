// api-client.js
import { ALERTS, SIGN_IN_PAGE } from './constants.js';

// Same host as the page, so the API and the page are one site and the
// SameSite=Strict refresh cookie is sent.
const BASE_URL = `http://${window.location.hostname}:3000/api`;

// In memory only (I-1): every page load buys a new one with the refresh cookie.
let accessToken = null;
let refreshing = null;

async function send(path, options = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    try {
        return await fetch(`${BASE_URL}${path}`, { ...options, headers, credentials: 'include' });
    } catch {
        throw new Error(ALERTS.serverDown);
    }
}

async function readBody(res) {
    if (res.status === 204) return null;
    const data = await res.json();
    if (!res.ok) {
        const err = new Error(data.error?.message || 'API error');
        err.status = res.status;
        err.field = data.error?.field;
        throw err;
    }
    return data;
}

// One refresh at a time: a refresh token works once, and spending it twice would
// sign the user out everywhere (I-13).
function refreshSession() {
    refreshing ??= send('/auth/refresh', { method: 'POST' })
        .then(readBody)
        .then((data) => {
            accessToken = data.accessToken;
        })
        .finally(() => {
            refreshing = null;
        });
    return refreshing;
}

// Never settles, so no caller shows an error while the browser leaves for sign-in.
function goToSignIn() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    window.location.href = `${SIGN_IN_PAGE}?next=${encodeURIComponent(page)}`;
    return new Promise(() => {});
}

async function renewSession() {
    try {
        await refreshSession();
    } catch (err) {
        if (err.status === 401) return goToSignIn();
        throw err;
    }
}

async function apiFetch(path, options = {}) {
    if (!accessToken) await renewSession();
    const tokenSent = accessToken;
    let res = await send(path, options);
    if (res.status === 401) {
        // Another call may have renewed it meanwhile.
        if (accessToken === tokenSent) await renewSession();
        res = await send(path, options);
    }
    return readBody(res);
}

export async function register(email, password) {
    const res = await send('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    return readBody(res);
}

export async function signIn(email, password) {
    const res = await send('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    const data = await readBody(res);
    accessToken = data.accessToken;
    return data.user;
}

export async function signOut() {
    await readBody(await send('/auth/logout', { method: 'POST' }));
    accessToken = null;
}

export async function getCurrentUser() {
    return apiFetch('/auth/me');
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
