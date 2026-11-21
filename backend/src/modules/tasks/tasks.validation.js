'use strict';

const MAX_TITLE_LENGTH = 200;

function validateTitle(title) {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        const err = new Error('Title is required');
        err.status = 400;
        err.field = 'title';
        throw err;
    }
    if (title.trim().length > MAX_TITLE_LENGTH) {
        const err = new Error(`Title must be ${MAX_TITLE_LENGTH} characters or fewer`);
        err.status = 400;
        err.field = 'title';
        throw err;
    }
}

function validateId(id) {
    const parsed = parseInt(id, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        const err = new Error('Invalid task id');
        err.status = 400;
        throw err;
    }
    return parsed;
}

module.exports = { validateTitle, validateId };

