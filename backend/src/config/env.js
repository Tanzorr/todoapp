'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const MIN_SECRET_LENGTH = 32;

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'todo_app';

const JWT_SECRET = process.env.JWT_SECRET || '';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

function assertAuthConfig() {
    for (const [name, value] of [
        ['JWT_SECRET', JWT_SECRET],
        ['JWT_REFRESH_SECRET', JWT_REFRESH_SECRET],
    ]) {
        if (value.length < MIN_SECRET_LENGTH) {
            throw new Error(`[config] ${name} must be set to at least ${MIN_SECRET_LENGTH} chars`);
        }
    }
    if (JWT_SECRET === JWT_REFRESH_SECRET) {
        throw new Error('[config] JWT_SECRET and JWT_REFRESH_SECRET must differ');
    }
    if (!Number.isInteger(BCRYPT_ROUNDS) || BCRYPT_ROUNDS < 4 || BCRYPT_ROUNDS > 31) {
        throw new Error('[config] BCRYPT_ROUNDS must be an integer from 4 to 31');
    }
}

assertAuthConfig();

module.exports = {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    BCRYPT_ROUNDS,
};
