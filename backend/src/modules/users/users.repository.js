'use strict';

const { query } = require('../../db/pool');

const SUMMARY_SELECT = `SELECT u.id, u.email, u.name, u.role, u.created_at, COUNT(t.id) AS task_count
    FROM users u LEFT JOIN tasks t ON t.user_id = u.id`;

function rowToUser(row) {
    return {
        id: row.id,
        email: row.email,
        name: row.name ?? '',
        role: row.role,
        createdAt: row.created_at,
    };
}

function rowToSummary(row) {
    return { ...rowToUser(row), taskCount: Number(row.task_count) };
}

async function findById(id) {
    const rows = await query('SELECT id, email, name, role, created_at FROM users WHERE id = ?', [
        id,
    ]);
    return rows.length ? rowToUser(rows[0]) : null;
}

async function findCredentialsByEmail(email) {
    const rows = await query('SELECT id, password_hash FROM users WHERE email = ?', [email]);
    return rows.length ? { id: rows[0].id, passwordHash: rows[0].password_hash } : null;
}

async function findPasswordHash(id) {
    const rows = await query('SELECT password_hash FROM users WHERE id = ?', [id]);
    return rows.length ? rows[0].password_hash : null;
}

async function findAllSummaries() {
    const rows = await query(`${SUMMARY_SELECT} GROUP BY u.id ORDER BY u.id ASC`, []);
    return rows.map(rowToSummary);
}

async function findSummaryById(id) {
    const rows = await query(`${SUMMARY_SELECT} WHERE u.id = ? GROUP BY u.id`, [id]);
    return rows.length ? rowToSummary(rows[0]) : null;
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

async function updateName(id, name) {
    await query('UPDATE users SET name = ? WHERE id = ?', [name, id]);
    return findById(id);
}

async function updateEmail(id, email) {
    try {
        await query('UPDATE users SET email = ? WHERE id = ?', [email, id]);
        return findById(id);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return null;
        throw err;
    }
}

async function updatePasswordHash(id, passwordHash) {
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
}

async function setRole(id, role) {
    await query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
}

async function remove(id) {
    await query('DELETE FROM users WHERE id = ?', [id]);
}

module.exports = {
    findById,
    findCredentialsByEmail,
    findPasswordHash,
    findAllSummaries,
    findSummaryById,
    create,
    updateName,
    updateEmail,
    updatePasswordHash,
    setRole,
    remove,
};
