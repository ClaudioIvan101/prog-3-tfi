import express from "express";

import routes from "./routes/index.js";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";

// Construye la app sin levantarla, para poder testearla.
const app = express();
app.disable("x-powered-by");

// Evita que el navegador infiera otro tipo de contenido, incluso ante errores.
app.use((req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  next();
});

app.use(express.json({ limit: "100kb" }));

app.use(routes);

// El orden importa: not-found y luego el error handler de 4 argumentos.
app.use(notFound);
app.use(errorHandler);

export default app;
