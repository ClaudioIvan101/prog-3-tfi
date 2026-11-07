import parsePort from "../validators/port.js";

// Esta configuración corresponde al servidor HTTP.
// Si no se indica un modo, trabajamos en desarrollo.
const nodeEnv = process.env.NODE_ENV || "development";

// Rechazamos modos desconocidos para evitar comportamientos inesperados.
if (!["development", "test", "production"].includes(nodeEnv)) {
  throw new Error(
    "NODE_ENV debe ser development, test o production",
  );
}

const env = {
  nodeEnv,

  // Reutilizamos el validador HTTP existente.
  // Permite PORT=0 para que las pruebas obtengan un puerto disponible.
  port: parsePort(process.env.PORT),

  // Dentro de Docker, permite recibir conexiones desde fuera del contenedor.
  host: process.env.HOST || "0.0.0.0",
};

// Conservamos la exportación que ya utiliza server.js.
export default env;