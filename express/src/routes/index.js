const { Router } = require("express");

const router = Router();

// Raiz: mantiene la respuesta historica de la API.
router.get("/", (req, res) => {
  res.json({ message: "API funcionando" });
});

// Health check para deploy y monitoreo.
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
  });
});

module.exports = router;
