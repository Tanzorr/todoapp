'use strict';

const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

async function migrate() {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

    console.log(`[migrate] found ${files.length} migration file(s)`);

    for (const file of files) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        // Split on semicolons to run statements individually
        const statements = sql.split(';').map(s => s.trim()).filter(Boolean);

        for (const statement of statements) {
            await pool.execute(statement);
        }

        console.log(`[migrate] ✓ ${file}`);
    }

    console.log('[migrate] done');
    await pool.end();
}

migrate().catch(err => {
    console.error('[migrate] error:', err.message);
    process.exit(1);
});

