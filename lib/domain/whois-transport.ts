/** Bounded port-43 transport, shared by live lookups and IANA discovery. */
import { createConnection, type Socket } from "node:net";

export const MAX_WHOIS_RESPONSE_BYTES = 1_000_000;

export type WhoisTransportOptions = {
  signal?: AbortSignal;
  timeoutMs?: number;
  connectTimeoutMs?: number;
};

/** No referrals: only the reviewed host is contacted, and only on port 43. */
export function readWhois(
  host: string,
  query: string,
  options: WhoisTransportOptions = {},
  connect: (options: { host: string; port: number }) => Socket = createConnection,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!/^[a-z0-9.-]+$/i.test(host) || /[\r\n\0]/.test(query) || query.length > 512) {
      reject(new Error("invalid_whois_query"));
      return;
    }
    if (options.signal?.aborted) { reject(new Error("whois_aborted")); return; }
    const socket = connect({ host, port: 43 });
    const chunks: Buffer[] = [];
    let length = 0;
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(totalTimer);
      clearTimeout(connectTimer);
      options.signal?.removeEventListener("abort", abort);
      socket.destroy();
      if (error) { reject(error); return; }
      const bytes = Buffer.concat(chunks);
      // Prefer UTF-8; legacy ccTLD servers sometimes return ISO-8859-1.
      try { resolve(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
      catch { resolve(bytes.toString("latin1")); }
    };
    const abort = () => finish(new Error("whois_aborted"));
    const totalTimer = setTimeout(() => finish(new Error("whois_timeout")), options.timeoutMs ?? 12_000);
    const connectTimer = setTimeout(() => finish(new Error("whois_timeout")),
      Math.min(options.connectTimeoutMs ?? 4_000, options.timeoutMs ?? 12_000));
    options.signal?.addEventListener("abort", abort, { once: true });
    socket.on("connect", () => {
      clearTimeout(connectTimer);
      socket.write(`${query}\r\n`);
    });
    socket.on("data", (chunk: Buffer) => {
      length += chunk.byteLength;
      if (length > MAX_WHOIS_RESPONSE_BYTES) { finish(new Error("oversized_response")); return; }
      chunks.push(chunk);
    });
    socket.on("end", () => finish());
    socket.on("error", () => finish(new Error("whois_connection_failed")));
    socket.on("close", () => { if (!settled) finish(new Error("whois_connection_failed")); });
  });
}
