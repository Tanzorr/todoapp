'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const h = require('./helpers');
const usersRepo = require('../src/modules/users/users.repository');
const authRepo = require('../src/modules/auth/auth.repository');
const { hashToken } = require('../src/modules/auth/auth.tokens');

before(h.startServer);
after(h.stopServer);

const NEW_PASSWORD = 'battery-staple-2';

function as(session) {
    return (method, path, body) => h.request(method, path, { token: session.token, body });
}

async function storedToken(cookie) {
    return authRepo.findByHash(hashToken(cookie.split('=')[1]));
}

describe('AC-2 / AC-3 who sees which User', () => {
    let admin;
    let alice;
    let bob;

    before(async () => {
        admin = await h.signUp('admin');
        alice = await h.signUp('alice');
        bob = await h.signUp('bob');
        await usersRepo.setRole(admin.user.id, 'admin');
        await as(alice)('POST', '/api/tasks', { title: 'One' });
    });

    it('the admin lists every User with taskCount and no password_hash', async () => {
        const res = await as(admin)('GET', '/api/users');

        assert.equal(res.status, 200);
        const row = res.body.find((user) => user.id === alice.user.id);
        assert.equal(row.taskCount, 1);
        assert.deepEqual(Object.keys(row).sort(), [
            'createdAt',
            'email',
            'id',
            'name',
            'role',
            'taskCount',
        ]);
    });

    it('anyone else gets 404 for the list and for another User', async () => {
        h.assertApiError(await as(alice)('GET', '/api/users'), 404);
        h.assertApiError(await as(alice)('GET', `/api/users/${bob.user.id}`), 404);
    });

    it('a User reads themself; the admin reads anyone', async () => {
        const me = await as(alice)('GET', '/api/users/me');
        const byId = await as(alice)('GET', `/api/users/${alice.user.id}`);
        const byAdmin = await as(admin)('GET', `/api/users/${alice.user.id}`);

        assert.equal(me.body.email, alice.email);
        assert.deepEqual(byId.body, me.body);
        assert.deepEqual(byAdmin.body, me.body);
        h.assertApiError(await as(admin)('GET', '/api/users/999999'), 404);
    });
});

describe('AC-4 name', () => {
    it('sets, trims and clears the name; over 80 chars → 400', async () => {
        const session = await h.signUp('name');
        const set = await as(session)('PATCH', '/api/users/me', { name: '  Olena  ' });
        const tooLong = await as(session)('PATCH', '/api/users/me', { name: 'x'.repeat(81) });
        const cleared = await as(session)('PATCH', '/api/users/me', { name: '' });

        assert.equal(set.body.name, 'Olena');
        h.assertApiError(tooLong, 400);
        assert.equal(tooLong.body.error.field, 'name');
        assert.equal(cleared.body.name, '');
    });
});

describe('AC-5 email', () => {
    it('needs the current password, refuses a taken email, then signs in with the new one', async () => {
        const session = await h.signUp('email');
        const other = await h.signUp('taken');
        const newEmail = h.uniqueEmail('moved');

        const wrong = await as(session)('PUT', '/api/users/me/email', {
            email: newEmail,
            currentPassword: 'not-it',
        });
        const taken = await as(session)('PUT', '/api/users/me/email', {
            email: other.email,
            currentPassword: h.PASSWORD,
        });
        const moved = await as(session)('PUT', '/api/users/me/email', {
            email: newEmail,
            currentPassword: h.PASSWORD,
        });
        const login = await h.request('POST', '/api/auth/login', {
            body: { email: newEmail, password: h.PASSWORD },
        });

        h.assertApiError(wrong, 400);
        assert.equal(wrong.body.error.field, 'currentPassword');
        h.assertApiError(taken, 409);
        assert.equal(moved.status, 200);
        assert.equal(moved.body.email, newEmail);
        assert.equal(login.status, 200);
    });
});

describe('AC-6 password', () => {
    it('refuses a wrong current or short new password', async () => {
        const session = await h.signUp('pw-bad');
        const wrong = await as(session)('PUT', '/api/users/me/password', {
            currentPassword: 'not-it',
            newPassword: NEW_PASSWORD,
        });
        const short = await as(session)('PUT', '/api/users/me/password', {
            currentPassword: h.PASSWORD,
            newPassword: '1234567',
        });

        h.assertApiError(wrong, 400);
        assert.equal(wrong.body.error.field, 'currentPassword');
        h.assertApiError(short, 400);
        assert.equal(short.body.error.field, 'newPassword');
    });

    it('revokes every older session, starts a new one, and retires the old password', async () => {
        const session = await h.signUp('pw');
        const otherDevice = await h.request('POST', '/api/auth/login', {
            body: { email: session.email, password: h.PASSWORD },
        });
        const res = await as(session)('PUT', '/api/users/me/password', {
            currentPassword: h.PASSWORD,
            newPassword: NEW_PASSWORD,
        });

        assert.equal(res.status, 200);
        assert.equal(typeof res.body.accessToken, 'string');
        assert.notEqual((await storedToken(session.cookie)).revokedAt, null);
        assert.notEqual((await storedToken(h.cookieOf(otherDevice))).revokedAt, null);
        assert.equal((await storedToken(h.cookieOf(res))).revokedAt, null);

        const oldLogin = { email: session.email, password: h.PASSWORD };
        const newLogin = { email: session.email, password: NEW_PASSWORD };
        h.assertApiError(await h.request('POST', '/api/auth/login', { body: oldLogin }), 401);
        assert.equal((await h.request('POST', '/api/auth/login', { body: newLogin })).status, 200);
    });
});

describe('AC-7 delete', () => {
    it('needs the current password, then removes the User with Tasks and tokens', async () => {
        const session = await h.signUp('delete');
        const task = await as(session)('POST', '/api/tasks', { title: 'Gone soon' });
        await as(session)('POST', `/api/tasks/${task.body.id}/timer/start`);

        const wrong = await as(session)('DELETE', '/api/users/me', { currentPassword: 'not-it' });
        const res = await h.request('DELETE', '/api/users/me', {
            token: session.token,
            body: { currentPassword: h.PASSWORD },
        });

        h.assertApiError(wrong, 400);
        assert.equal(res.status, 204);
        assert.ok(res.setCookie.startsWith('refreshToken=;'));
        assert.equal(await usersRepo.findById(session.user.id), null);
        assert.equal(await storedToken(session.cookie), null);
        const refresh = await h.request('POST', '/api/auth/refresh', { cookie: session.cookie });
        h.assertApiError(refresh, 401);
    });
});
