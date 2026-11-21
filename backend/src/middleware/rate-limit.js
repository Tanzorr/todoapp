'use strict';

const { rateLimit } = require('express-rate-limit');
const { AUTH_RATE_LIMIT } = require('../config/env');

const WINDOW_MS = 60 * 1000;

const authRateLimit = rateLimit({
    windowMs: WINDOW_MS,
    limit: AUTH_RATE_LIMIT,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler(req, res, next) {
        const err = new Error('Too many attempts, try again in a minute');
        err.status = 429;
        next(err);
    },
});

module.exports = { authRateLimit };
