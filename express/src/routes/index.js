import { Router } from "express";
import getHealth from "../controllers/healthController.js";

const router = Router();

// Raiz: mantiene la respuesta historica de la API.
router.get("/", (req, res) => {
  res.json({ message: "API funcionando" });
});

// Health check para deploy y monitoreo.
router.get("/health", getHealth);

const users = [
  { id: 0, nombre: "Claudio", apellido: "Gomez", edad: 30 },
  { id: 1, nombre: "Claudio", apellido: "Perez", edad: 30 },
];

router.get("/users", (req, res) => res.json(users));
router.get("/users/:id", (req, res) => {
  const user = users.find((item) => item.id === Number(req.params.id));
  if (user) return res.send("hola " + user.apellido);
  res.status(404).send("No encontrado");
});

// User creation is not implemented yet.
router.post("/users", (req, res) => res.sendStatus(501));

export default router;
