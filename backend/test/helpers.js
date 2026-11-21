'use strict';

// Set before anything loads config/env.js — dotenv never overrides a variable already set.
const crypto = require('crypto');

process.env.DB_NAME = 'todo_app_test';
process.env.JWT_SECRET = crypto.randomBytes(48).toString('hex');
process.env.JWT_REFRESH_SECRET = crypto.randomBytes(48).toString('hex');
process.env.AUTH_RATE_LIMIT ??= '1000';

const { once } = require('events');
const assert = require('node:assert/strict');
const { DB_NAME } = require('../src/config/env');
const { up } = require('../src/db/migrate');
const { pool } = require('../src/db/pool');
const { app } = require('../src/app');
const usersRepo = require('../src/modules/users/users.repository');

if (!DB_NAME.endsWith('_test')) {
    throw new Error(`tests run only against a *_test database, not "${DB_NAME}"`);
}

const PASSWORD = 'correct-horse-1';
const createdUserIds = [];
let server;
let baseUrl;

async function startServer() {
    await up();
    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    baseUrl = `http://127.0.0.1:${server.address().port}`;
}

async function stopServer() {
    for (const id of createdUserIds) await usersRepo.remove(id);
    server.close();
    await pool.end();
}

async function request(method, path, { token, cookie, body } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;
    if (cookie) headers.Cookie = cookie;

    const res = await fetch(baseUrl + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    const json = text ? JSON.parse(text) : null;
    if (path === '/api/auth/register' && res.status === 201) createdUserIds.push(json.id);

    return { status: res.status, body: json, setCookie: res.headers.getSetCookie()[0] ?? null };
}

function uniqueEmail(label) {
    return `${label}-${crypto.randomUUID()}@test.invalid`;
}

function cookieOf(res) {
    return res.setCookie ? res.setCookie.split(';')[0] : null;
}

async function signUp(label) {
    const email = uniqueEmail(label);
    await request('POST', '/api/auth/register', { body: { email, password: PASSWORD } });
    const login = await request('POST', '/api/auth/login', { body: { email, password: PASSWORD } });
    return { email, user: login.body.user, token: login.body.accessToken, cookie: cookieOf(login) };
}

function assertApiError(res, status) {
    assert.equal(res.status, status);
    assert.equal(res.body.error.status, status);
    assert.match(res.body.error.code, /^[A-Z_]+$/);
    assert.equal(typeof res.body.error.message, 'string');
}

module.exports = {
    PASSWORD,
    startServer,
    stopServer,
    request,
    uniqueEmail,
    cookieOf,
    signUp,
    assertApiError,
};
