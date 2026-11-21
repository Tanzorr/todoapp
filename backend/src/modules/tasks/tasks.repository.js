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

async function findAll() {
    const rows = await query('SELECT * FROM tasks ORDER BY id ASC', []);
    return rows.map(rowToTask);
}

async function findById(id) {
    const rows = await query('SELECT * FROM tasks WHERE id = ?', [id]);
    return rows.length ? rowToTask(rows[0]) : null;
}

async function create(title, description) {
    const result = await query(
        'INSERT INTO tasks (title, description) VALUES (?, ?)',
        [title, description || null]
    );
    return findById(result.insertId);
}

async function update(id, fields) {
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

    if (parts.length === 0) return findById(id);

    values.push(id);
    await query(`UPDATE tasks SET ${parts.join(', ')} WHERE id = ?`, values);
    return findById(id);
}

async function remove(id) {
    await query('DELETE FROM tasks WHERE id = ?', [id]);
}

module.exports = { findAll, findById, create, update, remove };

