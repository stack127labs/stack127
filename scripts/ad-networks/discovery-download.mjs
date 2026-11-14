import { createReadStream } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { storageError } from './storage-errors.mjs';

export async function downloadToFile(source, previous, { maxTimeSeconds, accept, apply = false }, dependencies = {}) {
  const makeTemp = dependencies.mkdtemp ?? mkdtemp;
  const read = dependencies.readFile ?? readFile;
  const start = dependencies.spawn ?? spawn;
  let directory;
  try { directory = await makeTemp(join(tmpdir(), "stack127-source-")); }
  catch (error) { throw storageError(error); }
  const file = join(directory, "source-data");
  const headerFile = join(directory, "headers.txt");
  const args = [
    "--ipv4", "--http1.1", "--location", "--silent", "--show-error", "--fail",
    "--retry", "4", "--retry-all-errors", "--connect-timeout", "20",
    "--max-time", String(maxTimeSeconds), "--user-agent", "stack127bot/1.0 (+https://stack127.com/ad-networks)",
    "--header", `Accept: ${accept}`,
    "--dump-header", headerFile, "--output", file, "--write-out", "%{http_code} %{url_effective}",
  ];
  if (apply && previous?.url === source.url) {
    if (previous.etag && !/[\r\n]/.test(previous.etag)) args.push("--header", `If-None-Match: ${previous.etag}`);
    if (previous.lastModified && !/[\r\n]/.test(previous.lastModified)) args.push("--header", `If-Modified-Since: ${previous.lastModified}`);
  }
  args.push(source.url);
  try {
    const result = await new Promise((resolveDownload, rejectDownload) => {
      const child = start("curl", args, { stdio: ["ignore", "pipe", "pipe"] });
      let output = "";
      let errors = "";
      child.stdout.on("data", (chunk) => { output += chunk.toString(); });
      child.stderr.on("data", (chunk) => { errors = `${errors}${chunk.toString()}`.slice(-1000); });
      child.on("error", rejectDownload);
      child.on("close", (code) => {
        if (code === 0) return resolveDownload(output.trim());
        const error = new Error(`${source.key} download failed: ${errors.trim() || `curl exit ${code}`}`);
        // curl 23: local output/header write failed; 26: local input read failed.
        rejectDownload([23, 26].includes(code) ? storageError(error) : error);
      });
    });
    let headerText;
    try { headerText = await read(headerFile, "utf8"); }
    catch (error) { throw storageError(error); }
    const headerValue = (name) => [...headerText.matchAll(new RegExp(`^${name}:\\s*(.+)$`, "gim"))].at(-1)?.[1]?.trim() ?? null;
    const [status, finalUrl] = result.split(" ", 2);
    const body = status === "304" ? null : createReadStream(file);
    body?.on('error', error => { error.discoveryStorage = true; });
    const cleanup = async () => {
      try { await rm(directory, { recursive: true, force: true }); }
      catch (error) { throw storageError(error); }
    };
    return {
      status: Number(status),
      url: finalUrl,
      body,
      headers: { get: headerValue },
      cleanup,
    };
  } catch (error) {
    try { await rm(directory, { recursive: true, force: true }); }
    catch (cleanupError) { throw storageError(cleanupError); }
    throw error;
  }
}

