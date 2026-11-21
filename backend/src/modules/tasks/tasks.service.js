'use strict';

const repo = require('./tasks.repository');
const timerRepo = require('../timer/timer.repository');
const { validateTitle } = require('./tasks.validation');

async function listTasks(userId) {
    return repo.findAll(userId);
}

async function getTask(id, userId) {
    const task = await repo.findById(id, userId);
    if (!task) {
        const err = new Error('Task not found');
        err.status = 404;
        throw err;
    }
    return task;
}

async function createTask(userId, title, description) {
    validateTitle(title);
    return repo.create(userId, title.trim(), description);
}

async function updateTask(id, userId, fields) {
    const task = await repo.findById(id, userId);
    if (!task) {
        const err = new Error('Task not found');
        err.status = 404;
        throw err;
    }
    if (fields.title !== undefined) {
        validateTitle(fields.title);
        fields.title = fields.title.trim();
    }
    if (fields.done) {
        const open = await timerRepo.findOpenEntry(id, userId);
        if (open) await timerRepo.closeEntry(open.id, userId);
    }
    return repo.update(id, userId, fields);
}

async function deleteTask(id, userId) {
    const task = await repo.findById(id, userId);
    if (!task) {
        const err = new Error('Task not found');
        err.status = 404;
        throw err;
    }
    await repo.remove(id, userId);
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };
