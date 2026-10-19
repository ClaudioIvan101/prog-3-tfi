const express = require("express");

const routes = require("./routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

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

module.exports = app;
