'use strict';

const { STATUS_CODES } = require('http');

const INTERNAL_MESSAGE = 'Internal Server Error';

function statusOf(err) {
    return err.status >= 400 && err.status < 600 && STATUS_CODES[err.status] ? err.status : 500;
}

function codeFor(status) {
    return STATUS_CODES[status].toUpperCase().replace(/[^A-Z]+/g, '_');
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    const status = statusOf(err);
    if (status >= 500) console.error(err);

    res.status(status).json({
        error: {
            status,
            code: codeFor(status),
            message: status >= 500 ? INTERNAL_MESSAGE : err.message,
            ...(err.field ? { field: err.field } : {}),
        },
    });
}

module.exports = { errorHandler };
