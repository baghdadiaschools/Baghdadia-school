import test from "node:test";
import assert from "node:assert/strict";
import { createApp, categoryIds } from "../server/app.js";
test("health, empty categories, disabled AI and API errors", async () => {
  const server = createApp().listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const health = await fetch(base + "/api/health");
    assert.equal(health.status, 200);
    assert.equal((await health.json()).status, "ok");
    assert.equal(health.headers.get("x-powered-by"), null);
    const result = await (await fetch(base + "/api/categories")).json();
    assert.equal(result.categories.length, 8);
    assert.deepEqual(
      result.categories.map((c) => c.id),
      categoryIds,
    );
    assert.ok(
      result.categories.every(
        (c) => c.items.length === 0 && c.status === "empty",
      ),
    );
    assert.equal(result.aiEnabled, false);
    assert.equal((await fetch(base + "/api/missing")).status, 404);
  } finally {
    await new Promise((r) => server.close(r));
  }
});
