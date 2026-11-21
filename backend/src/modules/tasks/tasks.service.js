'use strict';

const repo = require('./tasks.repository');
const timerRepo = require('../timer/timer.repository');
const { validateTitle } = require('./tasks.validation');

async function listTasks() {
    return repo.findAll();
}

async function getTask(id) {
    const task = await repo.findById(id);
    if (!task) {
        const err = new Error('Task not found');
        err.status = 404;
        throw err;
    }
    return task;
}

async function createTask(title, description) {
    validateTitle(title);
    return repo.create(title.trim(), description);
}

async function updateTask(id, fields) {
    const task = await repo.findById(id);
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
        const open = await timerRepo.findOpenEntry(id);
        if (open) await timerRepo.closeEntry(open.id);
    }
    return repo.update(id, fields);
}

async function deleteTask(id) {
    const task = await repo.findById(id);
    if (!task) {
        const err = new Error('Task not found');
        err.status = 404;
        throw err;
    }
    await repo.remove(id);
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };

