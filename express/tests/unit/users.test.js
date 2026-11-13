import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from '../../src/infra/passwordHasher.js';
import { createPostgresUserRepository } from '../../src/infra/userRepository.js';
import { DuplicateEmailError } from '../../src/domain/users/createUser.js';

test('scrypt utiliza salts diferentes y verifica contraseñas', async () => {
  const first = await hashPassword('una contraseña segura');
  const second = await hashPassword('una contraseña segura');
  assert.notEqual(first, second);
  assert.equal(await verifyPassword('una contraseña segura', first), true);
  assert.equal(await verifyPassword('contraseña equivocada', first), false);
  assert.equal(await verifyPassword('una contraseña segura', 'invalid'), false);
});

test('repositorio parametriza valores y no selecciona hashes', async () => {
  const calls = [];
  const repo = createPostgresUserRepository({ async query(sql, values) { calls.push({ sql, values }); return { rows: [{}] }; } });
  await repo.create({ name: 'Ana', email: 'ana@example.com', passwordHash: 'hash', role: 'vendedor' });
  await repo.list();
  await repo.findById('id');
  assert.deepEqual(calls[0].values, ['Ana', 'ana@example.com', 'hash', 'vendedor']);
  assert.match(calls[0].sql, /\$1/);
  assert.deepEqual(calls[2].values, ['id']);
  assert.doesNotMatch(calls[1].sql, /password_hash/);
  assert.doesNotMatch(calls[2].sql, /password_hash/);
});

test('solo el índice único de email se traduce a conflicto', async () => {
  const repo = createPostgresUserRepository({ async query() { throw Object.assign(new Error(), { code: '23505', constraint: 'users_email_unique' }); } });
  await assert.rejects(repo.create({}), DuplicateEmailError);
});
