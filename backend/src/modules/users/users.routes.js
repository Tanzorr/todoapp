'use strict';

const express = require('express');
const ctrl = require('./users.controller');
const { authRateLimit } = require('../../middleware/rate-limit');

const router = express.Router();

router.get('/', ctrl.listUsers);
router.get('/me', ctrl.getMe);
router.patch('/me', ctrl.updateMe);
router.put('/me/email', authRateLimit, ctrl.changeEmail);
router.put('/me/password', authRateLimit, ctrl.changePassword);
router.delete('/me', authRateLimit, ctrl.deleteMe);
router.get('/:id', ctrl.getUser);

module.exports = router;
