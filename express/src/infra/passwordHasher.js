import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
// Parámetros fijados para que el formato almacenado siga siendo verificable.
const options = { N: 16384, r: 8, p: 1 };

export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length > 1024) throw new TypeError('Contraseña inválida.');
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64, options);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

export async function verifyPassword(password, encoded) {
  if (typeof password !== 'string' || password.length > 1024 || typeof encoded !== 'string') return false;
  const parts = encoded.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt' || !/^[0-9a-f]{32}$/.test(parts[1]) || !/^[0-9a-f]{128}$/.test(parts[2])) return false;
  const expected = Buffer.from(parts[2], 'hex');
  const actual = await scrypt(password, Buffer.from(parts[1], 'hex'), expected.length, options);
  return timingSafeEqual(actual, expected);
}
