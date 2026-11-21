'use strict';

const { z } = require('zod');
const { validate } = require('../../lib/validate');
const { emailSchema, newPasswordSchema } = require('../auth/auth.validation');

const MAX_NAME_LENGTH = 80;
const CURRENT_PASSWORD_REQUIRED = 'Current password is required';
const INVALID_ID = 'Invalid user id';

const currentPassword = z
    .string({ error: CURRENT_PASSWORD_REQUIRED })
    .min(1, { error: CURRENT_PASSWORD_REQUIRED });

const nameSchema = z.object({
    name: z
        .string({ error: 'Name must be text' })
        .trim()
        .max(MAX_NAME_LENGTH, { error: `Name must be ${MAX_NAME_LENGTH} characters or fewer` }),
});

const emailChangeSchema = z.object({ email: emailSchema, currentPassword });

const passwordChangeSchema = z.object({ currentPassword, newPassword: newPasswordSchema });

const deletionSchema = z.object({ currentPassword });

const idSchema = z.preprocess(
    (value) => parseInt(value, 10),
    z.number({ error: INVALID_ID }).int({ error: INVALID_ID }).positive({ error: INVALID_ID })
);

function validateName(body) {
    return validate(nameSchema, body);
}

function validateEmailChange(body) {
    return validate(emailChangeSchema, body);
}

function validatePasswordChange(body) {
    return validate(passwordChangeSchema, body);
}

function validateDeletion(body) {
    return validate(deletionSchema, body);
}

function validateUserId(id) {
    return validate(idSchema, id);
}

module.exports = {
    validateName,
    validateEmailChange,
    validatePasswordChange,
    validateDeletion,
    validateUserId,
};
