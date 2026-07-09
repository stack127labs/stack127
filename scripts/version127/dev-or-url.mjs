#!/usr/bin/env node
import { spawn } from "node:child_process";
import { spawnSync } from "node:child_process";
import net from "node:net";

const port = 3333;
const hosts = ["127.0.0.1", "::1", "localhost"];
const url = `http://localhost:${port}`;

function hasListeningProcess() {
  const result = spawnSync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  return result.status === 0 && result.stdout.includes(`:${port}`);
}

function canConnect(host) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });

    const finish = (result) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(600);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

const isRunning = hasListeningProcess() || await Promise.any(
  hosts.map((host) => canConnect(host).then((connected) => {
    if (!connected) {
      throw new Error(`No server on ${host}:${port}`);
    }

    return true;
  })),
).catch(() => false);

if (isRunning) {
  console.log(`Version127 is already running: ${url}`);
  console.log("Open the URL above in the Codex browser.");
  process.exit(0);
}

console.log(`Starting Version127 at ${url}`);

const child = spawn("npm", ["run", "dev"], {
  shell: process.platform === "win32",
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
