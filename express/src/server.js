import { app, pool } from "./composition.js";
import env from "./config/env.js";

const { host, port } = env;

let poolClosing;
let shuttingDown = false;

function closePool() {
  // Compartimos la misma promesa para no ejecutar pool.end() dos veces.
  poolClosing ??= pool.end().catch(() => {
    console.error("No se pudo cerrar el pool de PostgreSQL.");
    process.exitCode = 1;
  });

  return poolClosing;
}

const server = app.listen(port, host, (error) => {
  if (error) {
    // Conservamos este mensaje porque las pruebas actuales lo verifican.
    console.error(
      `Unable to start HTTP server: ${error.code ?? "UNKNOWN"}`,
    );

    process.exitCode = 1;
    void closePool();
    return;
  }

  // Conservamos también el contrato de arranque de las pruebas existentes.
  console.log(`Server listening on port ${server.address().port}`);
});

// Cubre también los cierres directos realizados por las pruebas.
server.once("close", () => {
  void closePool();
});

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;

  // Primero dejamos terminar las solicitudes HTTP.
  // Después cerramos las conexiones de PostgreSQL.
  server.close((error) => {
    if (error && error.code !== "ERR_SERVER_NOT_RUNNING") {
      console.error("No se pudo cerrar el servidor HTTP.");
      process.exitCode = 1;
    }

    void closePool();
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

export default server;