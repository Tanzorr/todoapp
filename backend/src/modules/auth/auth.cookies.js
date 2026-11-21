'use strict';

const { REFRESH_TOKEN_TTL_SECONDS } = require('./auth.tokens');

const REFRESH_COOKIE = 'refreshToken';
const COOKIE_OPTIONS = { httpOnly: true, secure: true, sameSite: 'strict', path: '/api/auth' };

function readRefreshCookie(req) {
    for (const pair of (req.headers.cookie || '').split(';')) {
        const separator = pair.indexOf('=');
        if (separator !== -1 && pair.slice(0, separator).trim() === REFRESH_COOKIE) {
            return pair.slice(separator + 1).trim();
        }
    }
    return null;
}

function setRefreshCookie(res, token) {
    res.cookie(REFRESH_COOKIE, token, {
        ...COOKIE_OPTIONS,
        maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
    });
}

function clearRefreshCookie(res) {
    res.clearCookie(REFRESH_COOKIE, COOKIE_OPTIONS);
}

module.exports = { readRefreshCookie, setRefreshCookie, clearRefreshCookie };
