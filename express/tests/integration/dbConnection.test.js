import test from "node:test"
import assert from "node:assert"
import {createPostgresPool} from "../../src/infra/postgres.js";

test(
  "PostgreSQL responde desde la base configurada",
  { timeout: 10000 },
  async () => {
    const pool = createPostgresPool();

    try {
      const result = await pool.query(
        "SELECT 1 AS ok, current_database() AS database",
      );

      assert.equal(result.rows[0].ok, 1, "La consulta no devolvió 1");
      assert.equal(
        result.rows[0].database,
        process.env.PGDATABASE,
        "La conexión utiliza una base diferente de la configurada",
      );
    } finally {
      await pool.end();
    }
  },
);