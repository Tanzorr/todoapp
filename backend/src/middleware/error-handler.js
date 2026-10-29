'use strict';

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        error: {
            status,
            message,
            ...(err.field ? { field: err.field } : {}),
        },
    });
}

module.exports = { errorHandler };

