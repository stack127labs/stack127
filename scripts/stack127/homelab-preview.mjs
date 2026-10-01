import { spawn, execFileSync } from "node:child_process";
import { cp, mkdir, rm } from "node:fs/promises";
import net from "node:net";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));
const mode = process.argv[2];
const port = 3333;
const localUrl = `http://127.0.0.1:${port}/`;
const childEnv = { ...process.env };
delete childEnv.STACK127_TEST_DIST_DIR;

if (mode !== "build" && mode !== "rebuild") {
  console.error("Usage: node scripts/stack127/homelab-preview.mjs build|rebuild");
  process.exit(2);
}

let activeChild;
let requestedStop = false;
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    requestedStop = true;
    if (activeChild && activeChild.exitCode === null) activeChild.kill(signal);
  });
}

function getTailscaleIp() {
  const output = execFileSync("tailscale", ["status"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  const hostLine = output.split("\n").find((line) => /^100\.\d+\.\d+\.\d+\s+teja-homelab\s/.test(line));
  const ip = hostLine?.trim().split(/\s+/)[0];
  if (!/^100\.(?:\d{1,3}\.){2}\d{1,3}$/.test(ip)) {
    throw new Error("No Tailscale IPv4 address is available on this host.");
  }
  return ip;
}

function portIsInUse() {
  return new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
    socket.setTimeout(2000, () => {
      socket.destroy();
      resolve(true);
    });
  });
}

function runNpm(script) {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["run", script], {
      cwd: projectRoot,
      env: childEnv,
      stdio: "inherit",
    });
    activeChild = child;
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      activeChild = undefined;
      if (code === 0) resolve();
      else reject(new Error(`${script} ${signal ? `stopped by ${signal}` : `exited with code ${code}`}`));
    });
  });
}

async function waitForServer(child, hasStopped) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (hasStopped()) {
      throw new Error("The server stopped before it became ready.");
    }
    try {
      const response = await fetch(localUrl, { signal: AbortSignal.timeout(3000) });
      if (response.ok && !hasStopped()) return;
    } catch {
      // Next.js may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  child.kill("SIGTERM");
  throw new Error("The server did not become ready within 90 seconds.");
}

async function main() {
  const ip = getTailscaleIp();
  if (await portIsInUse()) {
    throw new Error(`Port ${port} is already in use. Address: http://${ip}:${port}/\nStop the existing server before starting this action.`);
  }

  if (mode === "rebuild") {
    console.log("Removing generated .next output...");
    await rm(new URL("../../.next", import.meta.url), { recursive: true, force: true });
  }

  console.log(mode === "rebuild" ? "Building from a clean output directory..." : "Building...");
  await runNpm("build");

  console.log("Preparing standalone assets...");
  await rm(new URL("../../.next/standalone/public", import.meta.url), { recursive: true, force: true });
  await cp(new URL("../../public", import.meta.url), new URL("../../.next/standalone/public", import.meta.url), {
    recursive: true,
  });
  await mkdir(new URL("../../.next/standalone/.next", import.meta.url), { recursive: true });
  await rm(new URL("../../.next/standalone/.next/static", import.meta.url), { recursive: true, force: true });
  await cp(new URL("../../.next/static", import.meta.url), new URL("../../.next/standalone/.next/static", import.meta.url), {
    recursive: true,
  });

  console.log("Starting the site...");
  const server = spawn(process.execPath, ["--env-file=.env.local", ".next/standalone/server.js"], {
    cwd: projectRoot,
    env: { ...childEnv, PORT: String(port), HOSTNAME: "0.0.0.0" },
    stdio: "inherit",
  });
  activeChild = server;
  let stopped = false;
  const serverExit = new Promise((resolve) => {
    server.once("error", (error) => {
      stopped = true;
      resolve({ error });
    });
    server.once("exit", (code, signal) => {
      stopped = true;
      resolve({ code, signal });
    });
  });
  await waitForServer(server, () => stopped);
  console.log(`\nSite ready: http://${ip}:${port}/\nPress Ctrl+C in this terminal to stop it.\n`);
  const result = await serverExit;
  activeChild = undefined;
  if (result.error) throw result.error;
  if (result.code !== 0 && !requestedStop && result.signal !== "SIGINT" && result.signal !== "SIGTERM") {
    throw new Error(`start exited with code ${result.code}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
