// Configuracion de entorno, leida y validada en un solo lugar.
// No guardar secretos aca: solo valores de arranque no sensibles.

const DEFAULT_PORT = 3000;
const DEFAULT_HOST = "0.0.0.0";

function parsePort(value) {
  if (value === undefined || value === "") {
    return DEFAULT_PORT;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`PORT invalido: "${value}" (se espera un entero entre 0 y 65535)`);
  }

  return port;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parsePort(process.env.PORT),
  host: process.env.HOST || DEFAULT_HOST,
};

module.exports = env;
