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

// Este endpoint no utiliza parámetros de consulta.
const campaignQuerySchema = z.strictObject({});

export function createCampaignRouter({ createCampaign }) {
  const router = Router();

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