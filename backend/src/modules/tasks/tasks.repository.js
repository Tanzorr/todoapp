'use strict';

const { query } = require('../../db/pool');

function rowToTask(row) {
    return {
        id: row.id,
        title: row.title,
        description: row.description ?? '',
        done: row.done === 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

async function findAll(userId) {
    const rows = await query('SELECT * FROM tasks WHERE user_id = ? ORDER BY id ASC', [userId]);
    return rows.map(rowToTask);
}

async function findById(id, userId) {
    const rows = await query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
    return rows.length ? rowToTask(rows[0]) : null;
}

async function create(userId, title, description) {
    const result = await query(
        'INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)',
        [userId, title, description || null]
    );
    return findById(result.insertId, userId);
}

async function update(id, userId, fields) {
    const parts = [];
    const values = [];

    if (fields.description !== undefined) {
        parts.push('description = ?');
        values.push(fields.description || null);
    }
    if (fields.title !== undefined) {
        parts.push('title = ?');
        values.push(fields.title);
    }
    if (fields.done !== undefined) {
        parts.push('done = ?');
        values.push(fields.done ? 1 : 0);
    }

    if (parts.length === 0) return findById(id, userId);

    values.push(id, userId);
    await query(`UPDATE tasks SET ${parts.join(', ')} WHERE id = ? AND user_id = ?`, values);
    return findById(id, userId);
}

async function remove(id, userId) {
    await query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
}

module.exports = { findAll, findById, create, update, remove };
