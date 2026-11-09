// Informa la actividad del proceso sin consultar la base de datos ni guardar la respuesta en caché.
function getHealth(req, res) {
  res.set("Cache-Control", "no-store");
  res.json({
    status: "ok",
    // esto devuelve el tiempo de actividad del proceso en segundos, útil para monitoreo y despliegue.
    uptime: process.uptime(),
  });
}

export default getHealth;
