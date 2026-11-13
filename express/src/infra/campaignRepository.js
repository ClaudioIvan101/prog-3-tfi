export function createPostgresCampaignRepository(pool) {
  return {
    // El repositorio recibe los datos validados y los envía a PostgreSQL.
    async create({ name, objective, status, startDate, endDate }) {
      // Los valores se envían separados del SQL.
      // PostgreSQL genera el identificador y las fechas de registro.
      const result = await pool.query(
        `INSERT INTO campaigns (
           name,
           objective,
           status,
           start_date,
           end_date
         )
         VALUES ($1, $2, $3, $4, $5)
         RETURNING
           id,
           name,
           objective,
           status,
           start_date AS "startDate",
           end_date AS "endDate",
           created_at AS "createdAt",
           updated_at AS "updatedAt"`,
        [name, objective, status, startDate, endDate],
      );
      // El resultado contiene un array de filas, aunque solo se inserta una.
      // Esto retorta el objeto con los campos de la campaña, incluyendo el id generado y las fechas de registro.
      return result.rows[0];
    },
    // Listar campañas con paginación.
    async list({ limit, offset }) {
      // Consultamos las campañas de la página solicitada.
      const result = await pool.query(
        `SELECT
           id,
           name,
           objective,
           status,
           start_date AS "startDate",
           end_date AS "endDate",
           created_at AS "createdAt",
           updated_at AS "updatedAt"
         FROM campaigns
         ORDER BY id DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      // Consultamos la cantidad total de campañas.
      const countResult = await pool.query(
        "SELECT COUNT(*) AS total FROM campaigns"
      );

      // Devolvemos las campañas y el total.
      return {
        items: result.rows,
        total: Number(countResult.rows[0].total)
      };
    }
  };
}