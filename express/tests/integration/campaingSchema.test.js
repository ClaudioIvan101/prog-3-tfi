import test from "node:test";
import assert from "node:assert/strict";
import { createPostgresPool } from "../../src/infra/postgres.js";

test("La base contiene las columnas requeridas de campañas", async () => {
  const pool = createPostgresPool();

  try {
    // Consultamos la estructura sin insertar registros.
    const result = await pool.query(`
      SELECT
        id,
        name,
        objective,
        status,
        start_date,
        end_date,
        created_at,
        updated_at
      FROM campaigns
      LIMIT 0
    `);

    assert.deepEqual(
      result.fields.map((field) => field.name),
      [
        "id",
        "name",
        "objective",
        "status",
        "start_date",
        "end_date",
        "created_at",
        "updated_at",
      ],
    );
  } finally {
    await pool.end();
  }
});