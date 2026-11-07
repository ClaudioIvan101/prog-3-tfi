import pg from "pg";
import { parseDatabaseEnv } from "../config/database-env.js";

export function createPostgresPool(values = process.env) {
  const config = parseDatabaseEnv(values);

  const pool = new pg.Pool({
    host: config.PGHOST,
    port: config.PGPORT,
    database: config.PGDATABASE,
    user: config.PGUSER,
    password: config.PGPASSWORD,
    max: 10,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 30000,
    query_timeout: 3000,
  });

  pool.on("error", (error) => {
    console.error(
      "Error en una conexión inactiva de PostgreSQL:",
      error.code ?? "DESCONOCIDO",
    );
  });

  return pool;
}