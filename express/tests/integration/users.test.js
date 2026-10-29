import { test } from "node:test";
import assert from "node:assert/strict";
import app from "../../src/app.js";

test("user routes are served by the configured application", async (t) => {
  const server = app.listen(0, "127.0.0.1");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const users = await (await fetch(`${base}/users`)).json();
  assert.equal(users.length, 2);
  assert.equal(await (await fetch(`${base}/users/1`)).text(), "hola Perez");
  assert.equal((await fetch(`${base}/users/999`)).status, 404);
  assert.equal((await fetch(`${base}/users`, { method: "POST" })).status, 501);
});
