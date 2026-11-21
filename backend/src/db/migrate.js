'use strict';

const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');
const { DB_NAME } = require('../config/env');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const UP_FILE = /^\d{3}_[\w-]+\.sql$/;

function listMigrations() {
    return fs
        .readdirSync(MIGRATIONS_DIR)
        .filter((file) => UP_FILE.test(file))
        .sort();
}

async function runFile(file) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);

    for (const statement of statements) {
        await pool.query(statement);
    }
}

async function ensureMigrationsTable() {
    await pool.query(
        `CREATE TABLE IF NOT EXISTS schema_migrations (
            name       VARCHAR(255) PRIMARY KEY,
            applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`
    );
}

async function appliedMigrations() {
    const [rows] = await pool.query('SELECT name FROM schema_migrations ORDER BY name ASC');
    return rows.map((row) => row.name);
}

async function up() {
    await ensureMigrationsTable();
    const applied = new Set(await appliedMigrations());
    const pending = listMigrations().filter((file) => !applied.has(file));

    for (const file of pending) {
        await runFile(file);
        await pool.query('INSERT INTO schema_migrations (name) VALUES (?)', [file]);
        console.log(`[migrate] ✓ ${file}`);
    }
    return pending;
}

async function down() {
    await ensureMigrationsTable();
    const last = (await appliedMigrations()).pop();
    if (!last) return null;

    const downFile = last.replace(/\.sql$/, '.down.sql');
    if (!fs.existsSync(path.join(MIGRATIONS_DIR, downFile))) {
        throw new Error(`${downFile} not found — cannot undo ${last}`);
    }
    await runFile(downFile);
    await pool.query('DELETE FROM schema_migrations WHERE name = ?', [last]);
    console.log(`[migrate] ↶ ${last}`);
    return last;
}

async function main(command) {
    if (command === 'down') {
        if (!DB_NAME.endsWith('_test') && !process.argv.includes('--force')) {
            throw new Error(`refusing to undo a migration on "${DB_NAME}"; add --force`);
        }
        const undone = await down();
        if (!undone) console.log('[migrate] nothing to undo');
        return;
    }
    const applied = await up();
    console.log(`[migrate] done, ${applied.length} applied`);
}

if (require.main === module) {
    main(process.argv[2])
        .catch((err) => {
            console.error('[migrate] error:', err.message);
            process.exitCode = 1;
        })
        .finally(() => pool.end());
}

module.exports = { up, down };
