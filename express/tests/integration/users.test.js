import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createApp } from '../../src/app.js';
import { makeCreateUser, DuplicateEmailError } from '../../src/domain/users/createUser.js';
import { makeListUsers } from '../../src/domain/users/listUsers.js';
import { makeGetUserById } from '../../src/domain/users/getUserById.js';

const id = 'af24e13f-a33f-4a5d-9e76-cbc3cdd7550a';
const payload = { name: ' Ana ', email: 'ANA@example.com', password: 'long password!', role: 'vendedor' };

async function setup(t, allowed) {
  const rows = [];
  const userRepository = {
    async create(data) {
      if (rows.some((row) => row.email === data.email)) throw new DuplicateEmailError();
      const row = { ...data, id, status: 'active', password_hash: data.passwordHash };
      rows.push(row);
      return row;
    },
    async list() { return rows; },
    async findById(value) { return rows.find((row) => row.id === value) ?? null; },
  };
  const users = {
    createUser: makeCreateUser({ userRepository, hashPassword: async () => 'fake-hash' }),
    listUsers: makeListUsers({ userRepository }),
    getUserById: makeGetUserById({ userRepository }),
    ...(allowed ? { authorize: async () => true } : {}),
  };
  const server = createApp({ users }).listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once('listening', resolve));
  return { base: `http://127.0.0.1:${server.address().port}`, rows };
}

test('usuarios: crear, consultar, validar y evitar exposición de secretos', async (t) => {
  const { base, rows } = await setup(t, true);
  const post = (body) => fetch(`${base}/users`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const created = await post(payload);
  assert.equal(created.status, 201);
  const user = await created.json();
  assert.equal(user.email, 'ana@example.com');
  assert.equal(user.name, 'Ana');
  assert.equal(rows[0].passwordHash, 'fake-hash');
  assert.equal('password' in user || 'password_hash' in user || 'passwordHash' in user, false);
  assert.equal((await post(payload)).status, 409);
  assert.equal((await post({ ...payload, role: 'intruso' })).status, 400);
  assert.equal((await post({ ...payload, extra: true })).status, 400);
  assert.equal((await post({ ...payload, email: 'no-email' })).status, 400);
  assert.equal((await fetch(`${base}/users`, { method: 'POST' })).status, 415);
  const list = await (await fetch(`${base}/users`)).json();
  assert.equal(list.length, 1);
  assert.equal('password_hash' in list[0], false);
  assert.equal('passwordHash' in list[0], false);
  const found = await fetch(`${base}/users/${id}`);
  assert.equal(found.status, 200);
  const foundBody = await found.json();
  assert.equal('password_hash' in foundBody || 'passwordHash' in foundBody || 'password' in foundBody, false);
  assert.equal((await fetch(`${base}/users/af24e13f-a33f-4a5d-9e76-cbc3cdd7550b`)).status, 404);
  assert.equal((await fetch(`${base}/users/no-es-uuid`)).status, 400);
});

test('usuarios: denegar por defecto todas las operaciones', async (t) => {
  const { base, rows } = await setup(t, false);
  assert.equal((await fetch(`${base}/users`)).status, 403);
  assert.equal((await fetch(`${base}/users/${id}`)).status, 403);
  assert.equal((await fetch(`${base}/users`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })).status, 403);
  assert.equal(rows.length, 0);
});

test('la composición real deniega los tres endpoints sin conectar PostgreSQL', () => {
  const composition = JSON.stringify(new URL('../../src/composition.js', import.meta.url).href);
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    const { app, pool } = await import(${composition});
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    try {
      const base = 'http://127.0.0.1:' + server.address().port;
      for (const [path, options] of [
        ['/users', {}],
        ['/users/af24e13f-a33f-4a5d-9e76-cbc3cdd7550a', {}],
        ['/users', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }],
      ]) assert.equal((await fetch(base + path, options)).status, 403);
    } finally {
      await new Promise(resolve => server.close(resolve));
      await pool.end();
    }
  `], {
    env: { ...process.env, PGHOST: '127.0.0.1', PGPORT: '5432', PGDATABASE: 'test', PGUSER: 'test', PGPASSWORD: 'test' },
    encoding: 'utf8', timeout: 5000,
  });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, result.stderr);
});

test('el montaje de usuarios conserva la creación HTTP de campañas', async (t) => {
  const campaigns = { create: async (data) => ({ id: 'campaign', ...data }) };
  const server = createApp({ campaigns, users: {} }).listen(0, '127.0.0.1');
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once('listening', resolve));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/campaigns`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Campaña', objective: 'Captación' }),
  });
  assert.equal(response.status, 201);
  assert.equal((await response.json()).name, 'Campaña');
});
