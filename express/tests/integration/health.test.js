import { test, before, after } from "node:test";
import assert from "node:assert/strict";

import app from "../../src/app.js";

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

test("GET /health responde 200 con status ok", async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("cache-control"), "no-store");

  const body = await res.json();
  assert.equal(body.status, "ok");
  assert.equal(typeof body.uptime, "number");
});

test("una ruta desconocida responde 404", async () => {
  const res = await fetch(`${baseUrl}/no-existe`);
  assert.equal(res.status, 404);
});
