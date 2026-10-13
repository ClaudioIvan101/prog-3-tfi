// Handler de errores de Express. Debe tener 4 argumentos y registrarse ultimo.
// Devuelve mensajes seguros: no expone stack traces al cliente.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = Number.isInteger(err.status) ? err.status : 500;

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    error: status >= 500 ? "Internal server error" : err.message,
  });
}

module.exports = errorHandler;
