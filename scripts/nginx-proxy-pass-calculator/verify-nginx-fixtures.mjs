import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const image = process.env.NGINX_FIXTURE_IMAGE ?? "nginx:1.30.4-alpine";
const unique = `v127-nginx-uri-${process.pid}`;
const network = `${unique}-network`;
const backend = `${unique}-backend`;
const proxy = `${unique}-proxy`;
const work = mkdtempSync(join(tmpdir(), "version127-nginx-uri-"));

const backendConfig = `server {
  listen 8080;
  location / {
    default_type text/plain;
    return 200 "$request_uri";
  }
}`;

const proxyConfig = `server {
  listen 8080;
  location /no-uri/ { proxy_pass http://${backend}:8080; }
  location /root-uri/ { proxy_pass http://${backend}:8080/; }
  location /v2-noslash/ { proxy_pass http://${backend}:8080/v2; }
  location /v2-slash/ { proxy_pass http://${backend}:8080/v2/; }
  location = /health { proxy_pass http://${backend}:8080/status; }
  location /app { proxy_pass http://${backend}:8080/; }
}`;

const fixtures = [
  ["FF-001", "/no-uri/users?id=42", "/no-uri/users?id=42"],
  ["FF-002", "/root-uri/users?id=42", "/users?id=42"],
  ["FF-003", "/v2-noslash/users", "/v2users"],
  ["FF-004", "/v2-slash/users", "/v2/users"],
  ["FF-005", "/health?deep=1", "/status?deep=1"],
  ["FF-006", "/no-uri/a?x=1&x=2", "/no-uri/a?x=1&x=2"],
  ["FF-007", "/app/users", "//users"],
];

function run(args, options = {}) {
  const result = spawnSync("docker", args, { encoding: "utf8", ...options });
  if (result.status !== 0) throw new Error(`docker ${args.join(" ")} failed:\n${result.stderr || result.stdout}`);
  return result.stdout.trim();
}

function readNginxVersion() {
  const result = spawnSync(
    "docker",
    ["run", "--rm", "--entrypoint", "nginx", image, "-v"],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(`Could not read the pinned NGINX version:\n${result.stderr || result.stdout}`);
  }
  return `${result.stderr}${result.stdout}`.trim();
}

function cleanup() {
  for (const name of [proxy, backend]) spawnSync("docker", ["rm", "-f", name], { encoding: "utf8" });
  spawnSync("docker", ["network", "rm", network], { encoding: "utf8" });
  rmSync(work, { recursive: true, force: true });
}

writeFileSync(join(work, "backend.conf"), backendConfig);
writeFileSync(join(work, "proxy.conf"), proxyConfig);

try {
  run(["image", "inspect", image]);
  run(["network", "create", network]);
  run(["run", "-d", "--rm", "--name", backend, "--network", network, "-v", `${join(work, "backend.conf")}:/etc/nginx/conf.d/default.conf:ro`, image]);
  run(["run", "-d", "--rm", "--name", proxy, "--network", network, "-v", `${join(work, "proxy.conf")}:/etc/nginx/conf.d/default.conf:ro`, image]);

  let ready = false;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const result = spawnSync("docker", ["exec", proxy, "wget", "-qO-", "http://127.0.0.1:8080/no-uri/ready"], { encoding: "utf8" });
    if (result.status === 0) {
      ready = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  if (!ready) throw new Error("Pinned NGINX fixture did not become ready.");

  const observed = [];
  for (const [id, requestTarget, expectedTarget] of fixtures) {
    const output = run(["exec", proxy, "wget", "-qO-", `http://127.0.0.1:8080${requestTarget}`]);
    if (output !== expectedTarget) throw new Error(`${id}: expected ${expectedTarget}, received ${output}`);
    observed.push({ id, requestTarget, expectedTarget, observedTarget: output });
  }

  const receipt = {
    checkedAt: new Date().toISOString(),
    image,
    imageId: run(["image", "inspect", image, "--format", "{{.Id}}"]),
    nginxVersion: readNginxVersion(),
    configurationSha256: createHash("sha256").update(`${backendConfig}\n${proxyConfig}`).digest("hex"),
    fixtures: observed,
  };
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
} finally {
  cleanup();
}
