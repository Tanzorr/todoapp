'use strict';

const { verifyAccessToken } = require('../modules/auth/auth.tokens');

const BEARER = /^Bearer\s+(\S+)$/i;

function unauthorized(message) {
    const err = new Error(message);
    err.status = 401;
    return err;
}

function authenticate(req, res, next) {
    const match = BEARER.exec(req.headers.authorization || '');
    if (!match) return next(unauthorized('Authentication required'));

    const userId = verifyAccessToken(match[1]);
    if (!userId) return next(unauthorized('Invalid or expired access token'));

    req.user = { id: userId };
    next();
}

module.exports = { authenticate };
