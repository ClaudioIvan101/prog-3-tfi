import { test } from "node:test";
import assert from "node:assert/strict";
import notFound from "../../src/middlewares/notFound.js";

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
