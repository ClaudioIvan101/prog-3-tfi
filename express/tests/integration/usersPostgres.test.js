import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createPostgresPool } from '../../src/infra/postgres.js';

// Solo en una base de pruebas explícitamente autorizada; usa un esquema propio.
test('PostgreSQL aplica migración y garantiza unicidad con concurrencia', {
  skip: process.env.RUN_USERS_DB_TESTS !== '1', timeout: 15000,
}, async () => {
  const pool = createPostgresPool();
  const schema = `users_test_${randomUUID().replaceAll('-', '')}`;
  let created = false;
  let first;
  let second;
  try {
    await pool.query(`CREATE SCHEMA "${schema}"`);
    created = true;
    first = await pool.connect();
    second = await pool.connect();
    await Promise.all([first.query(`SET search_path TO "${schema}"`), second.query(`SET search_path TO "${schema}"`)]);
    const sql = await readFile(new URL('../../database/migrations/003_create_users.sql', import.meta.url), 'utf8');
    await first.query(sql);
    const insert = 'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING email';
    const values = (email) => ['Ana', email, 'test-hash', 'vendedor'];
    const results = await Promise.allSettled([
      first.query(insert, values('Ana@example.com')),
      second.query(insert, values('ana@EXAMPLE.com')),
    ]);
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    const rejected = results.find((result) => result.status === 'rejected');
    assert.equal(rejected.reason.code, '23505');
    assert.equal(rejected.reason.constraint, 'users_email_unique');
    assert.equal(Number((await first.query('SELECT count(*) AS count FROM users')).rows[0].count), 1);
  } finally {
    first?.release();
    second?.release();
    try {
      if (created) await pool.query(`DROP SCHEMA "${schema}" CASCADE`);
    } finally {
      await pool.end();
    }
  }
});
