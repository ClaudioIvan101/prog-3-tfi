// Validate the listening port before the server starts.
function parsePort(value) {
  if (value === undefined || value === "") {
    return 3000;
  }

  const port = Number(value);
  if (!/^\d+$/.test(value) || !Number.isInteger(port) || port > 65535) {
    throw new Error("PORT must be a decimal integer between 0 and 65535");
  }

  return port;
}

export default parsePort;
