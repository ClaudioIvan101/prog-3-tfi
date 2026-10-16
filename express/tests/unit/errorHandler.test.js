const { test } = require("node:test");
const assert = require("node:assert/strict");
const errorHandler = require("../../src/middlewares/errorHandler");

function response() {
  return {
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; },
  };
}

test("invalid error statuses become a generic 500 response", (t) => {
  t.mock.method(console, "error", () => {});
  for (const status of [undefined, 200, 399, 600, 1000, "400"]) {
    const res = response();
    errorHandler(Object.assign(new Error("private detail"), { status }), {}, res, () => {});
    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, { error: "Internal server error" });
  }
});

test("already-started responses delegate the same error to Express", () => {
  const error = new Error("stream failed");
  let delegated;
  errorHandler(error, {}, { headersSent: true }, (value) => { delegated = value; });
  assert.equal(delegated, error);
});

test("malformed JSON errors do not echo submitted body fragments", () => {
  const res = response();
  const error = { status: 400, type: "entity.parse.failed", message: "Unexpected token: secret" };
  errorHandler(error, {}, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: "Invalid JSON body" });
});

test("ordinary client errors retain their existing response contract", () => {
  const res = response();
  errorHandler({ status: 422, message: "Invalid input" }, {}, res, () => {});
  assert.equal(res.statusCode, 422);
  assert.deepEqual(res.body, { error: "Invalid input" });
});
