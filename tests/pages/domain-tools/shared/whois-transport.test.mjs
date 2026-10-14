import { test } from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { readWhois, MAX_WHOIS_RESPONSE_BYTES } from "../../../../lib/domain/whois-transport.ts";

class FakeSocket extends EventEmitter {
  writes = [];
  destroyed = false;
  write(query) { this.writes.push(query); return true; }
  destroy() { this.destroyed = true; }
}
function connection(socket, events) {
  return () => { queueMicrotask(() => events(socket)); return socket; };
}

test("WHOIS sends CRLF, reads all chunks until end and safely decodes latin-1", async () => {
  const socket = new FakeSocket();
  const result = await readWhois("whois.example.test", "example.test/e", {}, connection(socket, s => {
    s.emit("connect"); s.emit("data", Buffer.from("Domain: example.test\nRegistrar: Caf"));
    s.emit("data", Buffer.from([0xe9])); s.emit("end");
  }));
  assert.deepEqual(socket.writes, ["example.test/e\r\n"]);
  assert.match(result, /Café$/);
  assert.equal(socket.destroyed, true);
});

test("large responses are stopped and partial answers are rejected on socket error", async () => {
  for (const events of [s => s.emit("data", Buffer.alloc(MAX_WHOIS_RESPONSE_BYTES + 1)), s => { s.emit("data", Buffer.from("Domain: example.test")); s.emit("error", new Error("private socket details")); }, s => s.emit("close")]) {
    const socket = new FakeSocket();
    await assert.rejects(readWhois("whois.example.test", "example.test", {}, connection(socket, events)), /oversized_response|whois_connection_failed/);
    assert.equal(socket.destroyed, true);
  }
});

test("connection and total timeouts close the socket", async () => {
  for (const connected of [false, true]) {
    const socket = new FakeSocket();
    await assert.rejects(readWhois("whois.example.test", "example.test", { timeoutMs: 20, connectTimeoutMs: 10 }, connection(socket, s => { if (connected) s.emit("connect"); })), /whois_timeout/);
    assert.equal(socket.destroyed, true);
  }
});

test("abort closes the socket and an already-aborted query never connects", async () => {
  const controller = new AbortController();
  const socket = new FakeSocket();
  await assert.rejects(readWhois("whois.example.test", "example.test", { signal: controller.signal }, connection(socket, s => { s.emit("connect"); controller.abort(); })), /whois_aborted/);
  assert.equal(socket.destroyed, true);
  await assert.rejects(readWhois("whois.example.test", "example.test", { signal: controller.signal }, () => { assert.fail("must not connect"); }), /whois_aborted/);
});

test("query newlines are rejected before any outbound socket", async () => {
  await assert.rejects(readWhois("whois.example.test", "example.test\r\nother", {}, () => assert.fail("must not connect")), /invalid_whois_query/);
});
