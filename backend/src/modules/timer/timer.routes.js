'use strict';

const express = require('express');
const ctrl = require('./timer.controller');

// mergeParams: true — allows access to :taskId from parent router
const router = express.Router({ mergeParams: true });

router.get('/', ctrl.getTimerTotal);
router.post('/start', ctrl.startTimer);
router.post('/stop', ctrl.stopTimer);

module.exports = router;

