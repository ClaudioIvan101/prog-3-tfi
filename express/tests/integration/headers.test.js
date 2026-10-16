const { test } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../../src/app");

test("health responses omit the Express identification header", async (t) => {
  const server = app.listen(0, "127.0.0.1");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once("listening", resolve));

  const res = await fetch(`http://127.0.0.1:${server.address().port}/health`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("x-powered-by"), null);
  await res.arrayBuffer();
});
