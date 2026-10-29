'use strict';

function validateTaskId(id) {
    const parsed = parseInt(id, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        const err = new Error('Invalid task id');
        err.status = 400;
        throw err;
    }
    return parsed;
}

module.exports = { validateTaskId };

