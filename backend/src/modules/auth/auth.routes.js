'use strict';

const express = require('express');
const ctrl = require('./auth.controller');
const { authRateLimit } = require('../../middleware/rate-limit');

const router = express.Router();

router.post('/register', authRateLimit, ctrl.register);
router.post('/login', authRateLimit, ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);

module.exports = router;
