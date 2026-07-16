'use strict';

function notFound(req, res, next) {
    res.status(404).json({
        error: {
            status: 404,
            message: `Route ${req.method} ${req.originalUrl} not found`,
        },
    });
}

module.exports = { notFound };

