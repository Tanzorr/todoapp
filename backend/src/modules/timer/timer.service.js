'use strict';

const taskRepo = require('../tasks/tasks.repository');
const timerRepo = require('./timer.repository');

async function assertTaskExists(taskId, userId) {
    const task = await taskRepo.findById(taskId, userId);
    if (!task) {
        const err = new Error('Task not found');
        err.status = 404;
        throw err;
    }
}

async function startTimer(taskId, userId) {
    await assertTaskExists(taskId, userId);

    const open = await timerRepo.findOpenEntry(taskId, userId);
    if (open) {
        const err = new Error('Timer is already running for this task');
        err.status = 409;
        throw err;
    }

    const entry = await timerRepo.createEntry(taskId, userId);
    if (!entry) {
        const err = new Error('Task not found');
        err.status = 404;
        throw err;
    }
    return {
        entryId: entry.id,
        taskId: entry.task_id,
        startedAt: entry.started_at,
    };
}

async function stopTimer(taskId, userId) {
    await assertTaskExists(taskId, userId);

    const open = await timerRepo.findOpenEntry(taskId, userId);
    if (!open) {
        const err = new Error('No running timer for this task');
        err.status = 409;
        throw err;
    }

    const entry = await timerRepo.closeEntry(open.id, userId);
    const elapsedSeconds = Math.round(
        (new Date(entry.stopped_at) - new Date(entry.started_at)) / 1000
    );

    return {
        entryId: entry.id,
        taskId: entry.task_id,
        startedAt: entry.started_at,
        stoppedAt: entry.stopped_at,
        elapsedSeconds,
    };
}

async function getTimerTotal(taskId, userId) {
    await assertTaskExists(taskId, userId);

    const totalSeconds = await timerRepo.getTotalSeconds(taskId, userId);
    const open = await timerRepo.findOpenEntry(taskId, userId);

    return {
        taskId,
        totalSeconds: Number(totalSeconds),
        isRunning: open !== null,
    };
}

module.exports = { startTimer, stopTimer, getTimerTotal };
