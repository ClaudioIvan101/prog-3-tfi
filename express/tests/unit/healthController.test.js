import { test } from "node:test";
import assert from "node:assert/strict";
import getHealth from "../../src/controllers/healthController.js";

test("health controller returns process liveness without infrastructure details", () => {
  let body;
  let cacheControl;
  getHealth({}, {
    set(name, value) { cacheControl = [name, value]; },
    json(value) { body = value; },
  });

  assert.deepEqual(cacheControl, ["Cache-Control", "no-store"]);
  assert.deepEqual(Object.keys(body), ["status", "uptime"]);
  assert.equal(body.status, "ok");
  assert.ok(body.uptime >= 0);
});
