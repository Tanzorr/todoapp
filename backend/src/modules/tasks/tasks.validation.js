'use strict';

const { z } = require('zod');
const { validate } = require('../../lib/validate');

const MAX_TITLE_LENGTH = 200;
const TITLE_REQUIRED = 'Title is required';
const INVALID_ID = 'Invalid task id';

const titleSchema = z
    .string({ error: TITLE_REQUIRED })
    .trim()
    .min(1, { error: TITLE_REQUIRED })
    .max(MAX_TITLE_LENGTH, { error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer` });

const idSchema = z.preprocess(
    (value) => parseInt(value, 10),
    z.number({ error: INVALID_ID }).int({ error: INVALID_ID }).positive({ error: INVALID_ID })
);

function validateTitle(title) {
    return validate(titleSchema, title, 'title');
}

function validateId(id) {
    return validate(idSchema, id);
}

module.exports = { validateTitle, validateId };
