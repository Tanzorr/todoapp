'use strict';

const { query } = require('../../db/pool');

async function findEntry(entryId, userId) {
    const rows = await query(
        `SELECT te.* FROM time_entries te JOIN tasks t ON t.id = te.task_id
         WHERE te.id = ? AND t.user_id = ?`,
        [entryId, userId]
    );
    return rows.length ? rows[0] : null;
}

async function findOpenEntry(taskId, userId) {
    const rows = await query(
        `SELECT te.* FROM time_entries te JOIN tasks t ON t.id = te.task_id
         WHERE te.task_id = ? AND t.user_id = ? AND te.stopped_at IS NULL LIMIT 1`,
        [taskId, userId]
    );
    return rows.length ? rows[0] : null;
}

async function createEntry(taskId, userId) {
    const result = await query(
        `INSERT INTO time_entries (task_id, started_at)
         SELECT id, NOW() FROM tasks WHERE id = ? AND user_id = ?`,
        [taskId, userId]
    );
    return result.affectedRows ? findEntry(result.insertId, userId) : null;
}

async function closeEntry(entryId, userId) {
    await query(
        `UPDATE time_entries te JOIN tasks t ON t.id = te.task_id
         SET te.stopped_at = NOW() WHERE te.id = ? AND t.user_id = ?`,
        [entryId, userId]
    );
    return findEntry(entryId, userId);
}

async function getTotalSeconds(taskId, userId) {
    const rows = await query(
        `SELECT SUM(TIMESTAMPDIFF(SECOND, te.started_at, COALESCE(te.stopped_at, NOW()))) AS total
         FROM time_entries te JOIN tasks t ON t.id = te.task_id
         WHERE te.task_id = ? AND t.user_id = ?`,
        [taskId, userId]
    );
    return rows[0].total || 0;
}

module.exports = { findOpenEntry, createEntry, closeEntry, getTotalSeconds };
