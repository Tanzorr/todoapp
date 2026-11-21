'use strict';

const { z } = require('zod');
const { validate } = require('../../lib/validate');

const INVALID_ID = 'Invalid task id';

const taskIdSchema = z.preprocess(
    (value) => parseInt(value, 10),
    z.number({ error: INVALID_ID }).int({ error: INVALID_ID }).positive({ error: INVALID_ID })
);

function validateTaskId(id) {
    return validate(taskIdSchema, id);
}

module.exports = { validateTaskId };
