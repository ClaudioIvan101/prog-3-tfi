// Informa la actividad del proceso sin consultar la base de datos ni guardar la respuesta en caché.
function getHealth(req, res) {
  res.set("Cache-Control", "no-store");
  res.json({
    status: "ok",
    uptime: process.uptime(),
  });
}

module.exports = getHealth;
