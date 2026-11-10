import test from "node:test";
import assert from "node:assert/strict";
import {
  fetchJson, jsonHeaders, jsonRequest,
  isNonEmptyString, assertNonEmptyString,
  getLocalStorage, readStorage, writeStorage, removeStorage
} from "../dist/index.js";

test("fetchJson returns parsed JSON and forwards request options", async (t) => {
  let received;
  t.mock.method(globalThis, "fetch", async (input, init) => {
    received = { input, init };
    return new Response(JSON.stringify({ ok: true, value: 42 }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  });

  const result = await fetchJson("https://example.test/api", {
    method: "POST",
    headers: { "x-test": "yes" }
  });

  assert.deepEqual(result, { ok: true, value: 42 });
  assert.equal(received.input, "https://example.test/api");
  assert.equal(received.init.method, "POST");
  assert.equal(received.init.headers["x-test"], "yes");
});

test("fetchJson throws a bounded HTTP error by default", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    new Response("failure detail ".repeat(40), { status: 503, statusText: "Service Unavailable" })
  );

  await assert.rejects(
    fetchJson("https://example.test/unavailable"),
    (error) => {
      assert.match(error.message, /HTTP 503 Service Unavailable/);
      assert.ok(error.message.length < 400);
      return true;
    }
  );
});

test("fetchJson can return JSON from non-2xx responses when opted in", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    new Response(JSON.stringify({ error: "unavailable" }), { status: 503 })
  );
  assert.deepEqual(
    await fetchJson("https://example.test/unavailable", { throwOnHttpError: false }),
    { error: "unavailable" }
  );
});

test("fetchJson reports invalid JSON with a TypeError and cause", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("not-json", { status: 200 }));
  await assert.rejects(fetchJson("https://example.test/invalid-json"), (error) => {
    assert.ok(error instanceof TypeError);
    assert.match(error.message, /not valid JSON/);
    assert.ok(error.cause);
    return true;
  });
});

test("jsonHeaders preserves caller headers and adds JSON defaults case-insensitively", () => {
  const headers = jsonHeaders({ Authorization: "Bearer example" });
  assert.equal(headers.get("authorization"), "Bearer example");
  assert.equal(headers.get("accept"), "application/json");
  assert.equal(headers.get("content-type"), "application/json");

  const custom = jsonHeaders({ accept: "text/plain", "content-type": "text/plain" });
  assert.equal(custom.get("accept"), "text/plain");
  assert.equal(custom.get("content-type"), "text/plain");
});

test("jsonRequest serializes JSON and preserves other RequestInit options", () => {
  const request = jsonRequest({ hello: "world" }, {
    method: "PATCH",
    headers: { "x-request-id": "abc" }
  });
  assert.equal(request.method, "PATCH");
  assert.equal(request.body, JSON.stringify({ hello: "world" }));
  assert.equal(new Headers(request.headers).get("x-request-id"), "abc");
  assert.equal(new Headers(request.headers).get("content-type"), "application/json");
  assert.throws(() => jsonRequest(undefined), TypeError);
});

test("string validation handles whitespace, non-strings and named assertion errors", () => {
  assert.equal(isNonEmptyString(" OCode "), true);
  assert.equal(isNonEmptyString("   "), false);
  assert.equal(isNonEmptyString(1), false);
  assert.doesNotThrow(() => assertNonEmptyString("ok", "project"));
  assert.throws(() => assertNonEmptyString("  ", "project"), /project must be a non-empty string/);
  assert.throws(() => assertNonEmptyString(null), /value must be a non-empty string/);
});

test("storage helpers safely handle valid, missing, malformed and failing storage", () => {
  const values = new Map();
  const storage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };

  assert.equal(readStorage(storage, "missing", "fallback"), "fallback");
  assert.equal(writeStorage(storage, "settings", { dark: true }), true);
  assert.deepEqual(readStorage(storage, "settings", {}), { dark: true });
  values.set("broken", "{");
  assert.equal(readStorage(storage, "broken", "fallback"), "fallback");
  assert.equal(removeStorage(storage, "settings"), true);
  assert.equal(values.has("settings"), false);
  assert.equal(writeStorage(storage, "circular", (() => { const value = {}; value.self = value; return value; })()), false);

  const blockedStorage = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
    removeItem() { throw new Error("blocked"); }
  };
  assert.equal(readStorage(blockedStorage, "key", 9), 9);
  assert.equal(writeStorage(blockedStorage, "key", 1), false);
  assert.equal(removeStorage(blockedStorage, "key"), false);
});

test("getLocalStorage is safe when storage is absent or throws", () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  try {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      get() { throw new Error("storage disabled"); }
    });
    assert.equal(getLocalStorage(), null);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor);
    else delete globalThis.localStorage;
  }
});
