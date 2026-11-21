'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../../config/env');

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const ALGORITHM = 'HS256';

function signAccessToken(userId) {
    return jwt.sign({}, JWT_SECRET, {
        subject: String(userId),
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
        algorithm: ALGORITHM,
    });
}

function signRefreshToken(userId) {
    const token = jwt.sign({}, JWT_REFRESH_SECRET, {
        subject: String(userId),
        jwtid: crypto.randomUUID(),
        expiresIn: REFRESH_TOKEN_TTL_SECONDS,
        algorithm: ALGORITHM,
    });
    return { token, expiresAt: new Date(jwt.decode(token).exp * 1000) };
}

function verifyUserId(token, secret) {
    try {
        const userId = Number(jwt.verify(token, secret, { algorithms: [ALGORITHM] }).sub);
        return Number.isInteger(userId) && userId > 0 ? userId : null;
    } catch {
        return null;
    }
}

function verifyAccessToken(token) {
    return verifyUserId(token, JWT_SECRET);
}

function verifyRefreshToken(token) {
    return verifyUserId(token, JWT_REFRESH_SECRET);
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
    REFRESH_TOKEN_TTL_SECONDS,
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    hashToken,
};
