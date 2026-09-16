import assert from "node:assert/strict";
import test from "node:test";
import {
  isSameOriginIpAsnRequest,
  networkClientKey,
  readIpAsnJsonBody,
} from "../../../lib/ip-asn/api.ts";

test("allows same-origin requests and rejects cross-origin requests", () => {
  const same = new Request("https://stack127.test/api/ip-asn-lookup", {
    method: "POST",
    headers: { origin: "https://stack127.test", host: "stack127.test" },
  });
  const cross = new Request("https://stack127.test/api/ip-asn-lookup", {
    method: "POST",
    headers: { origin: "https://evil.test", host: "stack127.test" },
  });
  assert.equal(isSameOriginIpAsnRequest(same), true);
  assert.equal(isSameOriginIpAsnRequest(cross), false);
});

test("reads a bounded object body and derives only a transient client key", async () => {
  const request = new Request("https://stack127.test/api/ip-asn-lookup", {
    method: "POST",
    headers: { "content-type": "application/json", "cf-connecting-ip": "203.0.113.4" },
    body: JSON.stringify({ query: "1.1.1.1" }),
  });
  assert.deepEqual(await readIpAsnJsonBody(request), { query: "1.1.1.1" });
  assert.equal(networkClientKey(request), "203.0.113.4");
});

test("rejects oversized or non-object JSON bodies", async () => {
  for (const body of ["x".repeat(4097), JSON.stringify(["1.1.1.1"]), "not-json"]) {
    const request = new Request("https://stack127.test/api/ip-asn-lookup", { method: "POST", body });
    await assert.rejects(() => readIpAsnJsonBody(request));
  }
});
