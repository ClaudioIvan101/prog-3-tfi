// Map process liveness to the existing HTTP health response; no database check.
function getHealth(req, res) {
  res.json({
    status: "ok",
    uptime: process.uptime(),
  });
}

module.exports = getHealth;
