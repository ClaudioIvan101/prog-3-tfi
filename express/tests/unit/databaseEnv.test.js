import test from "node:test";
import assert from "node:assert/strict";
import { parseDatabaseEnv } from "../../src/config/database-env.js";

// Configuración ficticia: estas pruebas no se conectan a PostgreSQL.
const validEnvironment = {
  PGHOST: "db",
  PGPORT: "5432",
  PGDATABASE: "base_de_prueba",
  PGUSER: "usuario_de_prueba",
  PGPASSWORD: "clave_ficticia_para_tests",
};

test("Convierte el puerto configurado a número", () => {
  const config = parseDatabaseEnv(validEnvironment);

  assert.equal(config.PGPORT, 5432);
  assert.equal(typeof config.PGPORT, "number");
});

test("Rechaza puertos inválidos e identifica la variable", () => {
  for (const port of ["hola", "", "0", "-1", "65536", "5432.5"]) {
    // Creamos una variante sin modificar la configuración de referencia.
    assert.throws(
      () => parseDatabaseEnv({
        ...validEnvironment,
        PGPORT: port,
      }),
      /PGPORT/,
      `Debió rechazar el puerto: ${JSON.stringify(port)}`,
    );
  }
});

test("Rechaza un nombre de servidor vacío", () => {
  assert.throws(
    () => parseDatabaseEnv({
      ...validEnvironment,
      PGHOST: "   ",
    }),
    /PGHOST/,
  );
});

test("Rechaza una contraseña compuesta solamente por espacios", () => {
  assert.throws(
    () => parseDatabaseEnv({
      ...validEnvironment,
      PGPASSWORD: "   ",
    }),
    /PGPASSWORD/,
  );
});