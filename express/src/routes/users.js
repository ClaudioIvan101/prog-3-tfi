import { Router } from 'express';
import { z } from 'zod';
import { DuplicateEmailError, InvalidUserError } from '../domain/users/createUser.js';

const bodySchema = z.strictObject({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().max(254).email(),
  password: z.string().min(12).max(1024),
  role: z.enum(['administrador', 'supervisor', 'vendedor']),
});
const querySchema = z.strictObject({});
const idSchema = z.string().uuid();

export function createUserRouter({ createUser, listUsers, getUserById, authorize = async () => false }) {
  const router = Router();
  router.use(async (req, res, next) => {
    if (await authorize(req) !== true) return res.status(403).json({ error: 'Acceso denegado.' });
    next();
  });
  router.post('/', async (req, res) => {
    if (req.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
      return res.status(415).json({ error: 'El cuerpo debe enviarse como application/json.' });
    }
    const body = bodySchema.safeParse(req.body);
    if (!body.success || !querySchema.safeParse(req.query).success) return res.status(400).json({ error: 'Datos inválidos.' });
    try {
      return res.status(201).json(await createUser(body.data));
    } catch (error) {
      if (error instanceof DuplicateEmailError) return res.status(409).json({ error: 'El correo ya está registrado.' });
      if (error instanceof InvalidUserError) return res.status(400).json({ error: 'Datos inválidos.' });
      throw error;
    }
  });
  router.get('/', async (req, res) => {
    if (!querySchema.safeParse(req.query).success) return res.status(400).json({ error: 'Datos inválidos.' });
    return res.json(await listUsers());
  });
  router.get('/:id', async (req, res) => {
    if (!idSchema.safeParse(req.params.id).success || !querySchema.safeParse(req.query).success) return res.status(400).json({ error: 'Datos inválidos.' });
    const user = await getUserById(req.params.id);
    return user ? res.json(user) : res.status(404).json({ error: 'Usuario no encontrado.' });
  });
  return router;
}
