const { test } = require("node:test");
const assert = require("node:assert/strict");
const getHealth = require("../../src/controllers/healthController");

test("health controller returns process liveness without infrastructure details", () => {
  let body;
  getHealth({}, { json: (value) => { body = value; } });

  assert.deepEqual(Object.keys(body), ["status", "uptime"]);
  assert.equal(body.status, "ok");
  assert.ok(body.uptime >= 0);
});
