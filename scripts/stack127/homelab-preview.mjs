import { spawn, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { access, cp, mkdir, open, readFile, readlink, realpath, rm } from "node:fs/promises";
import net from "node:net";
import path from "node:path";

const mode = process.argv[2];
if (!["build", "rebuild", "dev", "stop", "quality"].includes(mode)) {
  console.error("Usage: node scripts/stack127/homelab-preview.mjs build|rebuild|dev|stop|quality");
  process.exit(2);
}

// T3 runs actions in the chat's checkout. T3CODE_PROJECT_ROOT points at the
// main checkout, so it is only used to find the shared development environment.
const projectRoot = await realpath(process.cwd());
const statePath = path.join(projectRoot, "tmp/homelab-preview.json");
const nextPath = path.join(projectRoot, ".next");
const childEnv = { ...process.env };
delete childEnv.STACK127_TEST_DIST_DIR;
let mainRoot = process.env.T3CODE_PROJECT_ROOT;
let activeChild;
let activeExit;
let requestedStop = false;
let ownsState = false;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function checkStopped() {
  if (requestedStop) throw new Error("Preview stopped.");
}

function signalChild(signal) {
  if (!activeChild?.pid) return;
  try { process.kill(-activeChild.pid, signal); }
  catch (error) { if (error.code !== "ESRCH") throw error; }
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    requestedStop = true;
    signalChild("SIGTERM");
    setTimeout(() => signalChild("SIGKILL"), 10_000).unref();
  });
}

async function processIdentity(pid) {
  try {
    const stat = await readFile(`/proc/${pid}/stat`, "utf8");
    const fields = stat.slice(stat.lastIndexOf(")") + 2).split(" ");
    if (fields[0] === "Z") return null;
    return { started: fields[19], cwd: await readlink(`/proc/${pid}/cwd`) };
  } catch (error) {
    if (["ENOENT", "ESRCH"].includes(error.code)) return null;
    throw error;
  }
}

async function readState() {
  try { return JSON.parse(await readFile(statePath, "utf8")); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}

async function isOwner(state) {
  if (!state || !Number.isInteger(state.pid) || state.pid <= 1 || typeof state.started !== "string" || state.root !== projectRoot) return false;
  const identity = await processIdentity(state.pid);
  return identity?.started === state.started && identity.cwd === projectRoot;
}

async function stopPreview() {
  const state = await readState();
  if (!await isOwner(state)) {
    if (state) await rm(statePath, { force: true });
    if (mode === "stop") console.log("No preview is running for this checkout.");
    return;
  }
  console.log(`Stopping this checkout's ${state.mode} preview...`);
  try { process.kill(state.pid, "SIGTERM"); }
  catch (error) { if (error.code !== "ESRCH") throw error; }
  const deadline = Date.now() + 20_000;
  while (await isOwner(state)) {
    if (Date.now() >= deadline) throw new Error("The preview has not stopped yet. Wait and retry Stop preview.");
    await delay(100);
  }
  if (mode === "stop") console.log("Preview stopped.");
}

async function claimState() {
  await mkdir(path.dirname(statePath), { recursive: true });
  let file;
  try { file = await open(statePath, "wx", 0o600); }
  catch (error) {
    if (error.code === "EEXIST") throw new Error("Another preview action is starting in this checkout. Wait and retry.");
    throw error;
  }
  ownsState = true;
  try {
    const identity = await processIdentity(process.pid);
    await file.writeFile(JSON.stringify({ root: projectRoot, pid: process.pid, started: identity.started, mode }));
  } finally { await file.close(); }
}

function launch(command, args, env = childEnv) {
  checkStopped();
  activeChild = spawn(command, args, { cwd: projectRoot, env, stdio: "inherit", detached: true });
  activeExit = new Promise((resolve) => {
    activeChild.once("error", (error) => resolve({ error }));
    activeChild.once("exit", (code, signal) => resolve({ code, signal }));
  });
}

async function runNpm(args) {
  launch("npm", args);
  const result = await activeExit;
  // npm and the Next.js dev CLI can launch descendants. Clean up the whole
  // owned process group even when its leader exits before a descendant does.
  signalChild("SIGKILL");
  activeChild = undefined;
  checkStopped();
  if (result.error) throw result.error;
  if (result.code !== 0) throw new Error(`npm ${args.join(" ")} ${result.signal ? `stopped by ${result.signal}` : `exited with code ${result.code}`}`);
}

async function prepareEnvironment() {
  const candidates = [path.join(projectRoot, ".env.local")];
  if (mainRoot) candidates.push(path.join(mainRoot, ".env.local"));
  try {
    const commonDir = execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
      cwd: projectRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    mainRoot ??= path.dirname(commonDir);
    candidates.push(path.join(path.dirname(commonDir), ".env.local"));
  } catch { /* A standalone checkout can supply its own .env.local. */ }
  let loaded = false;
  for (const candidate of new Set(candidates)) {
    try { await access(candidate); }
    catch (error) { if (error.code === "ENOENT") continue; throw error; }
    process.loadEnvFile(candidate);
    Object.assign(childEnv, process.env);
    delete childEnv.STACK127_TEST_DIST_DIR;
    console.log(`Development environment: ${candidate}`);
    loaded = true;
    break;
  }
  if (!loaded && mode !== "quality") throw new Error("Missing .env.local. Set up the development environment in this checkout or the main project.");
  try { await access(path.join(projectRoot, "node_modules/next/dist/bin/next")); }
  catch (error) {
    if (error.code !== "ENOENT") throw error;
    console.log("Installing this checkout's dependencies...");
    await runNpm(["ci"]);
  }
}

function getTailscaleIp() {
  const ip = execFileSync("tailscale", ["ip", "-4"], {
    encoding: "utf8", stdio: ["ignore", "pipe", "inherit"],
  }).trim();
  if (!net.isIPv4(ip) || Number(ip.split(".")[0]) !== 100 || Number(ip.split(".")[1]) < 64 || Number(ip.split(".")[1]) > 127) {
    throw new Error("No Tailscale IPv4 address is available on this host.");
  }
  return ip;
}

function portAvailable(port) {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", (error) => {
      if (error.code === "EADDRINUSE") resolve(false);
      else reject(error);
    });
    probe.listen(port, "0.0.0.0", () => probe.close(() => resolve(true)));
  });
}

async function choosePort() {
  const first = !mainRoot || await realpath(mainRoot) === projectRoot
    ? 3333
    : 3400 + createHash("sha256").update(projectRoot).digest().readUInt32BE(0) % 10_000;
  for (let offset = 0; offset < 100; offset++) {
    checkStopped();
    if (await portAvailable(first + offset)) return first + offset;
  }
  throw new Error("No free preview port is available.");
}

async function prepareStandalone() {
  const standalone = path.join(nextPath, "standalone");
  for (const [source, destination] of [["public", "public"], [".next/static", ".next/static"]]) {
    checkStopped();
    const target = path.join(standalone, destination);
    await rm(target, { recursive: true, force: true });
    await cp(path.join(projectRoot, source), target, { recursive: true });
  }
}

async function startServer(port, ip) {
  const serverEnv = { ...childEnv, NODE_ENV: mode === "dev" ? "development" : "production", PORT: String(port), HOSTNAME: "0.0.0.0" };
  if (mode === "dev") launch(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-H", "0.0.0.0", "-p", String(port)], serverEnv);
  else launch(process.execPath, [".next/standalone/server.js"], serverEnv);
  let stopped = false;
  const serverStopped = new AbortController();
  activeExit.then(() => { stopped = true; serverStopped.abort(); });
  const waitMs = mode === "dev" ? 300_000 : 90_000;
  const requestMs = mode === "dev" ? 60_000 : 3000;
  const deadline = Date.now() + waitMs;
  const progress = setInterval(() => {
    console.log(mode === "dev" ? "Still compiling the first page..." : "Still waiting for the server...");
  }, 20_000);
  try {
    while (true) {
      checkStopped();
      if (stopped) {
        const result = await activeExit;
        throw result.error ?? new Error(`The server stopped before becoming ready (exit ${result.code}).`);
      }
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) throw new Error(`The server did not become ready within ${waitMs / 1000} seconds.`);
      try {
        const response = await fetch(`http://127.0.0.1:${port}/`, {
          signal: AbortSignal.any([serverStopped.signal, AbortSignal.timeout(Math.min(requestMs, remainingMs))]),
        });
        if (response.ok && !stopped) break;
      } catch { /* Next.js may still be starting. */ }
      if (stopped) continue;
      await delay(500);
    }
  } finally { clearInterval(progress); }
  console.log(`\nSite ready: http://${ip}:${port}/\nUse Stop preview or press Ctrl+C in this terminal to stop it.\n`);
  const result = await activeExit;
  if (result.error) throw result.error;
  if (result.code !== 0 && !requestedStop) throw new Error(`The preview server exited with code ${result.code}.`);
}

async function main() {
  const pkg = JSON.parse(await readFile(path.join(projectRoot, "package.json"), "utf8"));
  if (pkg.name !== "stack127") throw new Error("Run this action from a stack127 checkout.");
  console.log(`Checkout: ${projectRoot}`);
  try {
    console.log(`Branch: ${execFileSync("git", ["branch", "--show-current"], { cwd: projectRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() || "detached HEAD"}`);
  } catch { /* A standalone checkout may have no Git metadata. */ }
  if (mode === "quality") {
    await prepareEnvironment();
    await runNpm(["run", "quality"]);
    return;
  }
  await stopPreview();
  if (mode === "stop") return;
  checkStopped();
  await claimState();
  const ip = getTailscaleIp();
  await prepareEnvironment();
  const port = await choosePort();
  if (mode === "rebuild") {
    console.log("Removing this checkout's generated .next output...");
    await rm(nextPath, { recursive: true, force: true });
  }
  if (mode === "dev") {
    await runNpm(["run", "predev"]);
  } else {
    await runNpm(["run", "build"]);
    await prepareStandalone();
  }
  await startServer(port, ip);
}

try { await main(); }
catch (error) {
  if (!requestedStop) { console.error(error.message); process.exitCode = 1; }
} finally {
  if (activeChild?.pid) {
    signalChild("SIGTERM");
    const timeout = setTimeout(() => signalChild("SIGKILL"), 10_000);
    await activeExit;
    clearTimeout(timeout);
    signalChild("SIGKILL");
  }
  if (ownsState) await rm(statePath, { force: true });
}
