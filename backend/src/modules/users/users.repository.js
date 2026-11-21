'use strict';

const { query } = require('../../db/pool');

function rowToUser(row) {
    return {
        id: row.id,
        email: row.email,
        createdAt: row.created_at,
    };
}

async function findById(id) {
    const rows = await query('SELECT id, email, created_at FROM users WHERE id = ?', [id]);
    return rows.length ? rowToUser(rows[0]) : null;
}

async function findCredentialsByEmail(email) {
    const rows = await query('SELECT id, password_hash FROM users WHERE email = ?', [email]);
    return rows.length ? { id: rows[0].id, passwordHash: rows[0].password_hash } : null;
}

async function create(email, passwordHash) {
    try {
        const result = await query('INSERT INTO users (email, password_hash) VALUES (?, ?)', [
            email,
            passwordHash,
        ]);
        return findById(result.insertId);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return null;
        throw err;
    }
}

async function remove(id) {
    await query('DELETE FROM users WHERE id = ?', [id]);
}

module.exports = { findById, findCredentialsByEmail, create, remove };
