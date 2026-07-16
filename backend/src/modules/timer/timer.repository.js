'use strict';

const { query } = require('../../db/pool');

async function findOpenEntry(taskId) {
    const rows = await query(
        'SELECT * FROM time_entries WHERE task_id = ? AND stopped_at IS NULL LIMIT 1',
        [taskId]
    );
    return rows.length ? rows[0] : null;
}

async function createEntry(taskId) {
    const result = await query(
        'INSERT INTO time_entries (task_id, started_at) VALUES (?, NOW())',
        [taskId]
    );
    const rows = await query('SELECT * FROM time_entries WHERE id = ?', [result.insertId]);
    return rows[0];
}

async function closeEntry(entryId) {
    await query(
        'UPDATE time_entries SET stopped_at = NOW() WHERE id = ?',
        [entryId]
    );
    const rows = await query('SELECT * FROM time_entries WHERE id = ?', [entryId]);
    return rows[0];
}

async function getTotalSeconds(taskId) {
    const rows = await query(
        `SELECT SUM(TIMESTAMPDIFF(SECOND, started_at, COALESCE(stopped_at, NOW()))) AS total
         FROM time_entries WHERE task_id = ?`,
        [taskId]
    );
    return rows[0].total || 0;
}

module.exports = { findOpenEntry, createEntry, closeEntry, getTotalSeconds };

