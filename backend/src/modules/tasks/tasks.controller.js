'use strict';

const service = require('./tasks.service');
const { validateId } = require('./tasks.validation');

async function listTasks(req, res, next) {
    try {
        const tasks = await service.listTasks(req.user.id);
        res.json(tasks);
    } catch (err) {
        next(err);
    }
}

async function getTask(req, res, next) {
    try {
        const id = validateId(req.params.id);
        const task = await service.getTask(id, req.user.id);
        res.json(task);
    } catch (err) {
        next(err);
    }
}

async function createTask(req, res, next) {
    try {
        const task = await service.createTask(req.user.id, req.body.title, req.body.description);
        res.status(201).json(task);
    } catch (err) {
        next(err);
    }
}

async function updateTask(req, res, next) {
    try {
        const id = validateId(req.params.id);
        const task = await service.updateTask(id, req.user.id, req.body);
        res.json(task);
    } catch (err) {
        next(err);
    }
}

async function deleteTask(req, res, next) {
    try {
        const id = validateId(req.params.id);
        await service.deleteTask(id, req.user.id);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };
