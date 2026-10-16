const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../../src/app");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

test("malformed JSON returns a safe 400 without submitted secrets", async () => {
  const res = await fetch(`${baseUrl}/health`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: '{"token":"private-value",',
  });
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "Invalid JSON body" });
});

test("JSON above the existing body-size limit returns 413", async () => {
  const res = await fetch(`${baseUrl}/health`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "x".repeat(100 * 1024) }),
  });
  assert.equal(res.status, 413);
});
