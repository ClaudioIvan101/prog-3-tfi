import express from "express";
import routes from "./routes/index.js";
import { createCampaignRouter } from "./routes/campaigns.js";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";

export function createApp({ campaigns } = {}) {
  const app = express();

  app.disable("x-powered-by");

  app.use((req, res, next) => {
    res.set("X-Content-Type-Options", "nosniff");
    next();
  });

  // Primero interpretamos el JSON; después ejecutamos las rutas.
  app.use(express.json({ limit: "100kb" }));

  // Conservamos las rutas existentes.
  app.use(routes);

  if (campaigns !== undefined) {
    app.use( "/campaigns", createCampaignRouter({
        // El router recibe solamente la función que necesita.
        createCampaign: campaigns.create,
      }),
    );
  }

  // Estos manejadores siempre quedan después de las rutas.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

// Mantiene las pruebas generales independientes de PostgreSQL.
// El servidor real utiliza la app preparada en composition.js.
export default createApp();