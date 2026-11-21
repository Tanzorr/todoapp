'use strict';

const express = require('express');
const { notFound } = require('./middleware/not-found');
const { errorHandler } = require('./middleware/error-handler');
const { authenticate } = require('./middleware/authenticate');
const { NODE_ENV } = require('./config/env');

const app = express();

// The pages are served from another port, so the refresh cookie needs CORS with credentials,
// which needs the exact origin instead of '*'.
const LOCAL_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

// CORS — allow local pages in development
if (NODE_ENV === 'development') {
    app.use((req, res, next) => {
        if (LOCAL_ORIGIN.test(req.headers.origin || '')) {
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }
        res.setHeader('Vary', 'Origin');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (req.method === 'OPTIONS') return res.sendStatus(204);
        next();
    });
}

app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/tasks', authenticate, require('./modules/tasks/tasks.routes'));

// 404 and error handlers must be last
app.use(notFound);
app.use(errorHandler);

module.exports = { app };

