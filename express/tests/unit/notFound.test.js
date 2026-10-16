const { test } = require("node:test");
const assert = require("node:assert/strict");
const notFound = require("../../src/middlewares/notFound");

test("404 responses do not reflect query-string credentials", () => {
  let status;
  let body;
  const res = {
    status(value) { status = value; return this; },
    json(value) { body = value; },
  };

  notFound({ originalUrl: "/missing?token=private-value", path: "/missing" }, res);
  assert.equal(status, 404);
  assert.deepEqual(body, { error: "Not found", path: "/missing" });
});
