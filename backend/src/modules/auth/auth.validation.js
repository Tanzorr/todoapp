'use strict';

const { z } = require('zod');
const { validate } = require('../../lib/validate');

const MAX_EMAIL_LENGTH = 254;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72;

const email = z
    .string({ error: 'Email is required' })
    .trim()
    .toLowerCase()
    .max(MAX_EMAIL_LENGTH, { error: `Email must be ${MAX_EMAIL_LENGTH} characters or fewer` })
    .pipe(z.email({ error: 'Email must be a valid email address' }));

const registrationSchema = z.object({
    email,
    password: z
        .string({ error: 'Password is required' })
        .min(MIN_PASSWORD_LENGTH, {
            error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
        })
        .refine((value) => Buffer.byteLength(value, 'utf8') <= MAX_PASSWORD_BYTES, {
            error: `Password must be ${MAX_PASSWORD_BYTES} bytes or fewer`,
        }),
});

const loginSchema = z.object({
    email,
    password: z.string({ error: 'Password is required' }).min(1, { error: 'Password is required' }),
});

function validateRegistration(body) {
    return validate(registrationSchema, body);
}

function validateLogin(body) {
    return validate(loginSchema, body);
}

module.exports = { validateRegistration, validateLogin };
