'use strict';

const express = require('express');
const { notFound } = require('./middleware/not-found');
const { errorHandler } = require('./middleware/error-handler');
const { NODE_ENV } = require('./config/env');

const app = express();

// CORS — allow all origins in development
if (NODE_ENV === 'development') {
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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
app.use('/api/tasks', require('./modules/tasks/tasks.routes'));

// 404 and error handlers must be last
app.use(notFound);
app.use(errorHandler);

module.exports = { app };

