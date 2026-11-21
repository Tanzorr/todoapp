'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const h = require('./helpers');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { BCRYPT_ROUNDS, JWT_SECRET } = require('../src/config/env');
const usersRepo = require('../src/modules/users/users.repository');
const authRepo = require('../src/modules/auth/auth.repository');
const { hashToken } = require('../src/modules/auth/auth.tokens');

before(h.startServer);
after(h.stopServer);

const register = (body) => h.request('POST', '/api/auth/register', { body });
const login = (body) => h.request('POST', '/api/auth/login', { body });
const refresh = (cookie) => h.request('POST', '/api/auth/refresh', { cookie });
const USER_KEYS = ['createdAt', 'email', 'id', 'name', 'role'];

async function storedToken(cookie) {
    return authRepo.findByHash(hashToken(cookie.split('=')[1]));
}

describe('AC-2 register', () => {
    it('answers 201 with the user, trimmed and lowercased, without password_hash', async () => {
        const email = h.uniqueEmail('Mixed-Case');
        const res = await register({ email: `  ${email.toUpperCase()}  `, password: h.PASSWORD });

        assert.equal(res.status, 201);
        assert.deepEqual(Object.keys(res.body).sort(), USER_KEYS);
        assert.equal(res.body.role, 'user');
        assert.equal(res.body.email, email.toLowerCase());
    });

    it('answers 409 for the same email in another case', async () => {
        const email = h.uniqueEmail('dup');
        await register({ email, password: h.PASSWORD });
        const res = await register({ email: email.toUpperCase(), password: h.PASSWORD });

        h.assertApiError(res, 409);
        assert.equal(res.body.error.field, 'email');
    });

    it('answers 400 with field for a bad email or a short password', async () => {
        const email = h.uniqueEmail('short');
        const badEmail = await register({ email: 'not-an-email', password: h.PASSWORD });
        const shortPassword = await register({ email, password: '1234567' });

        h.assertApiError(badEmail, 400);
        assert.equal(badEmail.body.error.field, 'email');
        h.assertApiError(shortPassword, 400);
        assert.equal(shortPassword.body.error.field, 'password');
    });

    it('AC-3 stores a bcrypt hash at BCRYPT_ROUNDS', async () => {
        const email = h.uniqueEmail('hash');
        await register({ email, password: h.PASSWORD });
        const { passwordHash } = await usersRepo.findCredentialsByEmail(email);

        assert.equal(bcrypt.getRounds(passwordHash), BCRYPT_ROUNDS);
        assert.ok(await bcrypt.compare(h.PASSWORD, passwordHash));
    });
});

describe('AC-4 login', () => {
    it('answers 200 with accessToken and user, and sets the refresh cookie', async () => {
        const email = h.uniqueEmail('login');
        await register({ email, password: h.PASSWORD });
        const res = await login({ email, password: h.PASSWORD });

        assert.equal(res.status, 200);
        assert.equal(typeof res.body.accessToken, 'string');
        assert.deepEqual(Object.keys(res.body.user).sort(), USER_KEYS);
        for (const attribute of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Max-Age=604800']) {
            assert.ok(res.setCookie.includes(attribute), `${attribute} in ${res.setCookie}`);
        }
        assert.ok(res.setCookie.includes('Path=/api/auth;'));
    });

    it('answers the same 401 body for a wrong password and an unknown email', async () => {
        const email = h.uniqueEmail('wrong');
        await register({ email, password: h.PASSWORD });
        const wrongPassword = await login({ email, password: 'not-the-password' });
        const unknownEmail = await login({ email: h.uniqueEmail('nobody'), password: h.PASSWORD });

        h.assertApiError(wrongPassword, 401);
        assert.deepEqual(unknownEmail.body, wrongPassword.body);
        assert.equal(unknownEmail.status, 401);
        assert.equal(wrongPassword.setCookie, null);
    });

    it('AC-5 issues an access token that lives 900 s', async () => {
        const { token } = await h.signUp('ttl');
        const { iat, exp } = jwt.decode(token);

        assert.equal(exp - iat, 900);
    });
});

describe('AC-6 refresh', () => {
    it('rotates: new access token and cookie, old row revoked', async () => {
        const { cookie } = await h.signUp('rotate');
        const res = await refresh(cookie);

        assert.equal(res.status, 200);
        assert.equal(typeof res.body.accessToken, 'string');
        assert.notEqual(h.cookieOf(res), cookie);
        assert.notEqual((await storedToken(cookie)).revokedAt, null);
        assert.equal((await storedToken(h.cookieOf(res))).revokedAt, null);
    });

    it('answers 401 to a reused token and revokes all of that user’s tokens', async () => {
        const { email, cookie } = await h.signUp('reuse');
        const rotated = h.cookieOf(await refresh(cookie));
        const otherSession = h.cookieOf(await login({ email, password: h.PASSWORD }));

        h.assertApiError(await refresh(cookie), 401);
        assert.notEqual((await storedToken(rotated)).revokedAt, null);
        assert.notEqual((await storedToken(otherSession)).revokedAt, null);
        h.assertApiError(await refresh(rotated), 401);
    });

    it('answers 401 without a cookie or with a forged token', async () => {
        h.assertApiError(await refresh(undefined), 401);
        h.assertApiError(await refresh('refreshToken=not.a.jwt'), 401);
    });
});

describe('AC-7 logout', () => {
    it('revokes the token and clears the cookie; refreshing with it answers 401', async () => {
        const { cookie } = await h.signUp('logout');
        const res = await h.request('POST', '/api/auth/logout', { cookie });

        assert.equal(res.status, 204);
        assert.ok(res.setCookie.startsWith('refreshToken=;'));
        assert.ok(res.setCookie.includes('Expires=Thu, 01 Jan 1970'));
        assert.notEqual((await storedToken(cookie)).revokedAt, null);
        h.assertApiError(await refresh(cookie), 401);
    });
});

describe('AC-8 me', () => {
    it('answers 200 with the user and no password_hash', async () => {
        const { token, user } = await h.signUp('me');
        const res = await h.request('GET', '/api/auth/me', { token });

        assert.equal(res.status, 200);
        assert.deepEqual(res.body, user);
    });

    it('answers 401 for a missing, malformed or expired token', async () => {
        const { user } = await h.signUp('me-bad');
        const expired = jwt.sign({ iat: 1000 }, JWT_SECRET, {
            subject: String(user.id),
            expiresIn: 900,
        });

        h.assertApiError(await h.request('GET', '/api/auth/me'), 401);
        h.assertApiError(await h.request('GET', '/api/auth/me', { token: 'not.a.jwt' }), 401);
        h.assertApiError(await h.request('GET', '/api/auth/me', { token: expired }), 401);
    });
});

describe('AC-12 error shape', () => {
    it('applies to an unknown route', async () => {
        h.assertApiError(await h.request('GET', '/nope'), 404);
    });
});
