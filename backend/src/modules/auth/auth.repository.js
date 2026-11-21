'use strict';

const { query } = require('../../db/pool');

function rowToRefreshToken(row) {
    return {
        id: row.id,
        userId: row.user_id,
        expiresAt: row.expires_at,
        revokedAt: row.revoked_at,
    };
}

async function create(userId, tokenHash, expiresAt) {
    await query('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)', [
        userId,
        tokenHash,
        expiresAt,
    ]);
}

async function findByHash(tokenHash) {
    const rows = await query(
        'SELECT id, user_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = ?',
        [tokenHash]
    );
    return rows.length ? rowToRefreshToken(rows[0]) : null;
}

async function revoke(id) {
    const result = await query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ? AND revoked_at IS NULL',
        [id]
    );
    return result.affectedRows === 1;
}

async function revokeAllForUser(userId) {
    await query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL',
        [userId]
    );
}

module.exports = { create, findByHash, revoke, revokeAllForUser };
