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
  };
}