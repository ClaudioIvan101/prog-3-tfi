import { Router } from "express";
import { z } from "zod";
import {
  InvalidCampaignError,
} from "../domain/campaigns/createCampaign.js";

// Rechazamos campos desconocidos: no aceptamos objetos arbitrarios.
const campaignBodySchema = z.strictObject({
  name: z.string().trim().min(1),
  objective: z.string().trim().min(1),
  status: z.enum([
    "draft",
    "active",
    "paused",
    "completed",
  ]).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});
// Solo aceptamos page y limit como parámetros de consulta.
const listQuerySchema = z.strictObject({
  page: z.string().regex(/^[1-9]\d*$/).optional(),
  limit: z.string().regex(/^[1-9]\d*$/).optional()
});
// Este endpoint no utiliza parámetros de consulta.
const campaignQuerySchema = z.strictObject({});

export function createCampaignRouter({   createCampaign,  listCampaigns, }) {
  const router = Router();
  // esto permite que el router pueda ser probado de manera aislada, sin necesidad de un servidor HTTP real.
  router.get("/", async (req, res) => {
     console.log("ENTRÓ A GET /campaigns");
    const query = listQuerySchema.safeParse(req.query);

    if (!query.success) {
      return res.status(400).json({
        error: "Parámetros de consulta inválidos."
      });
    }

    // Valores predeterminados cuando no se envían parámetros.
    const page = Number(query.data.page ?? "1");
    const limit = Number(query.data.limit ?? "20");

    // Evitamos valores desmedidos o fuera del rango seguro.
    if (
      !Number.isSafeInteger(page) || page > 10000 ||
      !Number.isSafeInteger(limit) || limit > 100
    ) {
      return res.status(400).json({
        error: "Paginación fuera del rango permitido."
      });
    }

    // Delegamos la operación al caso de uso.
    const campaigns = await listCampaigns({ page, limit });

    return res.status(200).json(campaigns);
  });
  router.post("/", async (req, res) => {
    const mediaType = req.get("Content-Type")
      ?.split(";")[0]
      .trim()
      .toLowerCase();

    if (mediaType !== "application/json") {
      return res.status(415).json({
        error: "El cuerpo debe enviarse como application/json.",
      });
    }

    const body = campaignBodySchema.safeParse(req.body);
    const query = campaignQuerySchema.safeParse(req.query);

    if (!body.success || !query.success) {
      return res.status(400).json({
        error:
          "El cuerpo contiene campos inválidos, faltantes o desconocidos, o se enviaron parámetros de consulta no permitidos.",
      });
    }

    try {
      // El router entrega los datos al caso de uso.
      // No ejecuta SQL ni crea conexiones.
      const campaign = await createCampaign(body.data);

      return res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof InvalidCampaignError) {
        return res.status(422).json({
          error: error.message,
        });
      }

      // Express envía los errores de funciones async
      // al middleware general de errores.
      throw error;
    }
  });

  return router;
}