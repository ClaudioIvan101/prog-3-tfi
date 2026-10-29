// Configuracion de entorno, leida y validada en un solo lugar.
// No guardar secretos aca: solo valores de arranque no sensibles.

import parsePort from "../validators/port.js";
const DEFAULT_HOST = "0.0.0.0";
const nodeEnv = process.env.NODE_ENV || "development";

// Un modo incorrecto no debe desactivar por error el comportamiento de producción.
if (!["development", "test", "production"].includes(nodeEnv)) {
  throw new Error("NODE_ENV must be development, test or production");
}

const env = {
  nodeEnv,
  port: parsePort(process.env.PORT),
  host: process.env.HOST || DEFAULT_HOST,
};

export default env;
