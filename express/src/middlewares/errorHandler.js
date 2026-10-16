// Handler de errores de Express. Debe tener 4 argumentos y registrarse ultimo.
// Devuelve mensajes seguros: no expone stack traces al cliente.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (res.headersSent) {
    return next(err);
  }

  const status = Number.isInteger(err.status) && err.status >= 400 && err.status <= 599
    ? err.status
    : 500;
  const message = err.type === "entity.parse.failed" ? "Invalid JSON body" : err.message;

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    error: status >= 500 ? "Internal server error" : message,
  });
}

module.exports = errorHandler;
