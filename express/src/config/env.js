// Configuracion de entorno, leida y validada en un solo lugar.
// No guardar secretos aca: solo valores de arranque no sensibles.

const parsePort = require("../validators/port");
const DEFAULT_HOST = "0.0.0.0";

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parsePort(process.env.PORT),
  host: process.env.HOST || DEFAULT_HOST,
};

module.exports = env;
