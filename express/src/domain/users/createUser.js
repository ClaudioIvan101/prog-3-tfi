export class InvalidUserError extends Error {}
export class DuplicateEmailError extends Error {}

export function publicUser(user) {
  if (!user) return null;
  const { id, name, email, role, status, createdAt, updatedAt } = user;
  return { id, name, email, role, status, createdAt, updatedAt };
}

export function makeCreateUser({ userRepository, hashPassword }) {
  return async function createUser(input) {
    if (!input || typeof input.name !== 'string' || !input.name.trim() || input.name.length > 200 ||
        typeof input.email !== 'string' || input.email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) ||
        typeof input.password !== 'string' || input.password.length < 12 || input.password.length > 1024 ||
        !['administrador', 'supervisor', 'vendedor'].includes(input.role)) {
      throw new InvalidUserError('Datos de usuario inválidos.');
    }
    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({ name: input.name.trim(), email: input.email.trim().toLowerCase(), passwordHash, role: input.role });
    return publicUser(user);
  };
}
