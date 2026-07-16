'use strict';

const service = require('./timer.service');
const { validateTaskId } = require('./timer.validation');

async function startTimer(req, res, next) {
    try {
        const taskId = validateTaskId(req.params.taskId);
        const result = await service.startTimer(taskId);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
}

async function stopTimer(req, res, next) {
    try {
        const taskId = validateTaskId(req.params.taskId);
        const result = await service.stopTimer(taskId);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

async function getTimerTotal(req, res, next) {
    try {
        const taskId = validateTaskId(req.params.taskId);
        const result = await service.getTimerTotal(taskId);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

module.exports = { startTimer, stopTimer, getTimerTotal };

