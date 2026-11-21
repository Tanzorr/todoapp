'use strict';

const usersRepo = require('./users.repository');
const authRepo = require('../auth/auth.repository');
const authService = require('../auth/auth.service');
const {
    validateName,
    validateEmailChange,
    validatePasswordChange,
    validateDeletion,
} = require('./users.validation');

function userNotFound() {
    const err = new Error('User not found');
    err.status = 404;
    return err;
}

// Another User, or the list, does not exist for a non-admin (I-14).
async function assertAdmin(requesterId) {
    const requester = await usersRepo.findById(requesterId);
    if (!requester || requester.role !== 'admin') throw userNotFound();
}

// 400, not 401: the client reads 401 as an expired session and would sign the user out.
async function assertCurrentPassword(userId, password) {
    if (!(await authService.verifyPassword(userId, password))) {
        const err = new Error('Current password is incorrect');
        err.status = 400;
        err.field = 'currentPassword';
        throw err;
    }
}

async function listUsers(requesterId) {
    await assertAdmin(requesterId);
    return usersRepo.findAllSummaries();
}

async function getUser(requesterId, id) {
    if (id !== requesterId) await assertAdmin(requesterId);
    const user = await usersRepo.findSummaryById(id);
    if (!user) throw userNotFound();
    return user;
}

async function updateName(userId, body) {
    const { name } = validateName(body);
    return usersRepo.updateName(userId, name || null);
}

async function changeEmail(userId, body) {
    const { email, currentPassword } = validateEmailChange(body);
    await assertCurrentPassword(userId, currentPassword);
    const user = await usersRepo.updateEmail(userId, email);
    if (!user) {
        const err = new Error('Email is already registered');
        err.status = 409;
        err.field = 'email';
        throw err;
    }
    return user;
}

async function changePassword(userId, body) {
    const { currentPassword, newPassword } = validatePasswordChange(body);
    await assertCurrentPassword(userId, currentPassword);
    await usersRepo.updatePasswordHash(userId, await authService.hashPassword(newPassword));
    await authRepo.revokeAllForUser(userId);
    return authService.issueSession(await usersRepo.findById(userId));
}

async function deleteAccount(userId, body) {
    const { currentPassword } = validateDeletion(body);
    await assertCurrentPassword(userId, currentPassword);
    await usersRepo.remove(userId);
}

module.exports = { listUsers, getUser, updateName, changeEmail, changePassword, deleteAccount };
