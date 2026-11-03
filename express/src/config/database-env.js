import { z } from "zod";

// Regla reutilizable para nombres y direcciones:
// deben ser textos que no estén vacíos ni contengan solamente espacios.
const requiredText = z
  .string({ error: "Es obligatorio y debe ser texto" })
  .trim()
  .min(1, "No puede estar vacío");

// El esquema describe la configuración que necesita el cliente PostgreSQL.
// Declararlo no abre conexiones ni ejecuta consultas.
const databaseEnvSchema = z.object({
  PGHOST: requiredText,

  // Las variables de entorno llegan como texto.
  // Convertimos el puerto a número y comprobamos su tipo y rango.
  // No usamos parsePort: sus reglas corresponden al servidor HTTP.
  PGPORT: z.coerce
    .number({ error: "Debe ser un número válido" })
    .int("Debe ser un número entero")
    .min(1, "Debe ser mayor o igual a 1")
    .max(65535, "Debe ser menor o igual a 65535"),

  PGDATABASE: requiredText,
  PGUSER: requiredText,

  // No recortamos la contraseña: los espacios pueden formar parte de ella.
  // Solamente rechazamos valores vacíos o compuestos por espacios.
  PGPASSWORD: z
    .string({ error: "Es obligatorio y debe ser texto" })
    .min(1, "No puede estar vacío")
    .refine(
      (value) => value.trim().length > 0,
      "No puede contener solamente espacios",
    ),
});

// Normalmente recibimos las variables del proceso.
// Permitir otro objeto facilita probar la validación con datos ficticios.
export function parseDatabaseEnv(values = process.env) {
  // safeParse devuelve el resultado sin lanzar directamente un error.
  const result = databaseEnvSchema.safeParse(values);

  if (!result.success) {
    // Informamos qué variables fallaron, sin mostrar sus valores.
    // Esto evita imprimir contraseñas en los mensajes.
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Configuración de PostgreSQL inválida:\n${details}`,
    );
  }

  // Devolvemos la configuración validada.
  // PGPORT ya es un número, no el texto original.
  return result.data;
}