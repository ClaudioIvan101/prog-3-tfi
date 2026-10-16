const { Router } = require("express");
const getHealth = require("../controllers/healthController");

const router = Router();

// Raiz: mantiene la respuesta historica de la API.
router.get("/", (req, res) => {
  res.json({ message: "API funcionando" });
});

// Health check para deploy y monitoreo.
router.get("/health", getHealth);

module.exports = router;
