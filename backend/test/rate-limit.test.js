'use strict';

// Its own file, so its own process: the limit is the real default and the count starts at zero.
process.env.AUTH_RATE_LIMIT = '5';

const { it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const h = require('./helpers');

before(h.startServer);
after(h.stopServer);

it('AC-11 the 6th register or login from one IP within a minute → 429', async () => {
    const statuses = [];
    for (let i = 0; i < 3; i++) {
        const body = { email: h.uniqueEmail('limit'), password: h.PASSWORD };
        statuses.push((await h.request('POST', '/api/auth/register', { body })).status);
    }
    for (let i = 0; i < 2; i++) {
        const body = { email: h.uniqueEmail('nobody'), password: h.PASSWORD };
        statuses.push((await h.request('POST', '/api/auth/login', { body })).status);
    }
    assert.deepEqual(statuses, [201, 201, 201, 401, 401]);

    const body = { email: h.uniqueEmail('nobody'), password: h.PASSWORD };
    h.assertApiError(await h.request('POST', '/api/auth/login', { body }), 429);
    h.assertApiError(await h.request('POST', '/api/auth/register', { body }), 429);
});
