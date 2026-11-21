'use strict';

const service = require('./auth.service');
const { readRefreshCookie, setRefreshCookie, clearRefreshCookie } = require('./auth.cookies');

async function register(req, res, next) {
    try {
        const user = await service.register(req.body);
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const { accessToken, refreshToken, user } = await service.login(req.body);
        setRefreshCookie(res, refreshToken);
        res.json({ accessToken, user });
    } catch (err) {
        next(err);
    }
}

async function refresh(req, res, next) {
    try {
        const { accessToken, refreshToken, user } = await service.refresh(readRefreshCookie(req));
        setRefreshCookie(res, refreshToken);
        res.json({ accessToken, user });
    } catch (err) {
        next(err);
    }
}

async function logout(req, res, next) {
    try {
        await service.logout(readRefreshCookie(req));
        clearRefreshCookie(res);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
}

module.exports = { register, login, refresh, logout };
