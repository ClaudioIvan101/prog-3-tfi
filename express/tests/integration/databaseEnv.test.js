import test from "node:test";
import assert from "node:assert/strict";
import { parseDatabaseEnv } from "../../src/config/database-env.js";

const validEnvironment = {
  PGHOST: "db",
  PGPORT: "5432",
  PGDATABASE: "base_de_prueba",
  PGUSER: "usuario_de_prueba",
  PGPASSWORD: "clave_ficticia_para_tests",
};

test("La configuración convierte el puerto a número", () => {
  const config = parseDatabaseEnv(validEnvironment);

  assert.equal(config.PGPORT, 5432);
  assert.equal(typeof config.PGPORT, "number");
});

test("La configuración rechaza un puerto inválido", () => {
  assert.throws(
    () => parseDatabaseEnv({ ...validEnvironment, PGPORT: "hola" }),
    /PGPORT/,
  );
});

test("La configuración identifica una variable obligatoria vacía", () => {
  assert.throws(
    () => parseDatabaseEnv({ ...validEnvironment, PGHOST: "" }),
    /PGHOST/,
  );
});