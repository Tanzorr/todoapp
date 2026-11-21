'use strict';

const service = require('./users.service');
const { validateUserId } = require('./users.validation');
const { setRefreshCookie, clearRefreshCookie } = require('../auth/auth.cookies');

async function listUsers(req, res, next) {
    try {
        res.json(await service.listUsers(req.user.id));
    } catch (err) {
        next(err);
    }
}

async function getMe(req, res, next) {
    try {
        res.json(await service.getUser(req.user.id, req.user.id));
    } catch (err) {
        next(err);
    }
}

async function getUser(req, res, next) {
    try {
        const id = validateUserId(req.params.id);
        res.json(await service.getUser(req.user.id, id));
    } catch (err) {
        next(err);
    }
}

async function updateMe(req, res, next) {
    try {
        res.json(await service.updateName(req.user.id, req.body));
    } catch (err) {
        next(err);
    }
}

async function changeEmail(req, res, next) {
    try {
        res.json(await service.changeEmail(req.user.id, req.body));
    } catch (err) {
        next(err);
    }
}

async function changePassword(req, res, next) {
    try {
        const { accessToken, refreshToken, user } = await service.changePassword(
            req.user.id,
            req.body
        );
        setRefreshCookie(res, refreshToken);
        res.json({ accessToken, user });
    } catch (err) {
        next(err);
    }
}

async function deleteMe(req, res, next) {
    try {
        await service.deleteAccount(req.user.id, req.body);
        clearRefreshCookie(res);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
}

module.exports = { listUsers, getMe, getUser, updateMe, changeEmail, changePassword, deleteMe };
