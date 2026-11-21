'use strict';

const express = require('express');
const ctrl = require('./tasks.controller');
const timerRoutes = require('../timer/timer.routes');

const router = express.Router();

router.get('/', ctrl.listTasks);
router.get('/:id', ctrl.getTask);
router.post('/', ctrl.createTask);
router.put('/:id', ctrl.updateTask);
router.delete('/:id', ctrl.deleteTask);

// Nest timer routes under /:id/timer
router.use('/:taskId/timer', timerRoutes);

module.exports = router;

