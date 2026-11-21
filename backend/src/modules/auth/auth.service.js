'use strict';

const bcrypt = require('bcryptjs');
const usersRepo = require('../users/users.repository');
const authRepo = require('./auth.repository');
const tokens = require('./auth.tokens');
const { validateRegistration, validateLogin } = require('./auth.validation');
const { BCRYPT_ROUNDS } = require('../../config/env');

const INVALID_CREDENTIALS = 'Invalid email or password';
const INVALID_REFRESH_TOKEN = 'Invalid or expired refresh token';

let dummyHash = null;

function unauthorized(message) {
    const err = new Error(message);
    err.status = 401;
    return err;
}

// Compared against when the email is unknown, so both failures take one bcrypt compare.
function getDummyHash() {
    dummyHash ??= bcrypt.hash('no account has this password', BCRYPT_ROUNDS);
    return dummyHash;
}

async function issueSession(user) {
    const { token, expiresAt } = tokens.signRefreshToken(user.id);
    await authRepo.create(user.id, tokens.hashToken(token), expiresAt);
    return { accessToken: tokens.signAccessToken(user.id), refreshToken: token, user };
}

async function register(body) {
    const { email, password } = validateRegistration(body);
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await usersRepo.create(email, passwordHash);
    if (!user) {
        const err = new Error('Email is already registered');
        err.status = 409;
        err.field = 'email';
        throw err;
    }
    return user;
}

async function login(body) {
    const { email, password } = validateLogin(body);
    const credentials = await usersRepo.findCredentialsByEmail(email);
    const hash = credentials ? credentials.passwordHash : await getDummyHash();
    const matches = await bcrypt.compare(password, hash);
    if (!credentials || !matches) throw unauthorized(INVALID_CREDENTIALS);

    return issueSession(await usersRepo.findById(credentials.id));
}

async function refresh(refreshToken) {
    if (!refreshToken || !tokens.verifyRefreshToken(refreshToken)) {
        throw unauthorized(INVALID_REFRESH_TOKEN);
    }
    const stored = await authRepo.findByHash(tokens.hashToken(refreshToken));
    if (!stored) throw unauthorized(INVALID_REFRESH_TOKEN);

    // Revoked already, or revoked by a parallel refresh between the read and now: reuse (I-13).
    if (stored.revokedAt !== null || !(await authRepo.revoke(stored.id))) {
        await authRepo.revokeAllForUser(stored.userId);
        throw unauthorized(INVALID_REFRESH_TOKEN);
    }

    const user = await usersRepo.findById(stored.userId);
    if (!user) throw unauthorized(INVALID_REFRESH_TOKEN);
    return issueSession(user);
}

async function logout(refreshToken) {
    if (!refreshToken) return;
    const stored = await authRepo.findByHash(tokens.hashToken(refreshToken));
    if (stored) await authRepo.revoke(stored.id);
}

async function getCurrentUser(userId) {
    const user = await usersRepo.findById(userId);
    if (!user) throw unauthorized('Authentication required');
    return user;
}

module.exports = { register, login, refresh, logout, getCurrentUser };
