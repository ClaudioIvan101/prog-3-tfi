import app from "./app.js";
import env from "./config/env.js";
const { host, port } = env;

// Informa el puerto real o devuelve un fallo de arranque al supervisor del proceso.
const server = app.listen(port, host, (error) => {
  if (error) {
    console.error(`Unable to start HTTP server: ${error.code}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Server listening on port ${server.address().port}`);
});

// Apagado ordenado para no cortar requests en curso.
function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default server;
