'use strict';

const { app } = require('./app');
const { PORT } = require('./config/env');

app.listen(PORT, () => {
    console.log(`[server] running on http://localhost:${PORT}`);
    console.log(`[server] health: http://localhost:${PORT}/health`);
});

