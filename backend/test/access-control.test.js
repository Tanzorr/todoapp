'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const h = require('./helpers');

before(h.startServer);
after(h.stopServer);

const TASK_ROUTES = [
    ['GET', '/api/tasks'],
    ['POST', '/api/tasks'],
    ['GET', '/api/tasks/1'],
    ['PUT', '/api/tasks/1'],
    ['DELETE', '/api/tasks/1'],
    ['GET', '/api/tasks/1/timer'],
    ['POST', '/api/tasks/1/timer/start'],
    ['POST', '/api/tasks/1/timer/stop'],
];

describe('AC-9 every /api/tasks route needs a valid token', () => {
    for (const [method, path] of TASK_ROUTES) {
        it(`${method} ${path} → 401`, async () => {
            h.assertApiError(await h.request(method, path), 401);
            h.assertApiError(await h.request(method, path, { token: 'not.a.jwt' }), 401);
        });
    }
});

describe('AC-10 another user’s Task is a 404', () => {
    let asA;
    let asB;
    let taskId;
    let taskUrl;

    before(async () => {
        const a = await h.signUp('owner');
        const b = await h.signUp('intruder');
        asA = (method, path, body) => h.request(method, path, { token: a.token, body });
        asB = (method, path, body) => h.request(method, path, { token: b.token, body });
        const task = await asA('POST', '/api/tasks', { title: 'Private', description: 'mine' });
        taskId = task.body.id;
        taskUrl = `/api/tasks/${taskId}`;
    });

    async function snapshot() {
        const task = await asA('GET', taskUrl);
        const timer = await asA('GET', `${taskUrl}/timer`);
        return { task: task.body, isRunning: timer.body.isRunning };
    }

    it('B cannot read, update, delete or start the Timer of A’s stopped Task', async () => {
        const before = await snapshot();

        h.assertApiError(await asB('GET', taskUrl), 404);
        h.assertApiError(await asB('PUT', taskUrl, { title: 'Mine', done: true }), 404);
        h.assertApiError(await asB('GET', `${taskUrl}/timer`), 404);
        h.assertApiError(await asB('POST', `${taskUrl}/timer/start`), 404);
        h.assertApiError(await asB('DELETE', taskUrl), 404);

        assert.equal(before.isRunning, false);
        assert.deepEqual(await snapshot(), before);
        const list = await asB('GET', '/api/tasks');
        assert.ok(!list.body.some((task) => task.id === taskId));
    });

    it('B cannot stop A’s running Timer', async () => {
        assert.equal((await asA('POST', `${taskUrl}/timer/start`)).status, 201);

        h.assertApiError(await asB('POST', `${taskUrl}/timer/stop`), 404);

        assert.equal((await snapshot()).isRunning, true);
        assert.equal((await asA('POST', `${taskUrl}/timer/stop`)).status, 200);
    });
});
