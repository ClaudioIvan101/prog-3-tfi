const app = require("./app");
const { host, port } = require("./config/env");

const server = app.listen(port, host, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

// Apagado ordenado para no cortar requests en curso.
function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

module.exports = server;
