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

test("JSON responses declare nosniff, including parsing errors", async (t) => {
  const server = app.listen(0, "127.0.0.1");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once("listening", resolve));
  const url = `http://127.0.0.1:${server.address().port}`;

  for (const [pathname, options, status] of [
    ["/health", {}, 200],
    ["/missing", {}, 404],
    ["/health", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" }, 400],
  ]) {
    const res = await fetch(`${url}${pathname}`, options);
    assert.equal(res.status, status);
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    await res.arrayBuffer();
  }
});
