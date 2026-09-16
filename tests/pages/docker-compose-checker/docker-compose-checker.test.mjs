import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const fixture = (name) => readFileSync(path.join(root, "tests/pages/docker-compose-checker/fixtures", name), "utf8");
const { checkCompose, buildCopyReport, ENGINE_VERSION, LIMITS } = await import("../../../lib/docker-compose-checker/engine.ts");

test("reports the current Compose shape without runtime claims", () => {
  const result = checkCompose(fixture("valid-current-compose.yml"), "");
  assert.equal(result.status, "parsed");
  assert.equal(result.lead, "No blocking static issues found");
  assert.deepEqual(result.counts, {
    services: 2,
    publishedPorts: 1,
    namedVolumes: 1,
    networks: 1,
    secrets: 0,
    configs: 0,
    profiles: 0,
    interpolationTokens: 0,
    errors: 0,
    warnings: 0,
    advisories: 0,
  });
  assert.deepEqual(result.summary.services, ["web", "db"]);
  assert.deepEqual(result.summary.publishedPortKeys, ["127.0.0.1:8080/tcp"]);
  assert.equal(result.summary.dependencyEdges, 1);
  assert.equal(result.provenance.engineVersion, ENGINE_VERSION);
  assert.doesNotMatch(JSON.stringify(result), /runtime|daemon status|image pull status|container status/i);
});

test("treats version as an obsolete warning without changing the model", () => {
  const result = checkCompose(fixture("obsolete-version.yml"), "");
  assert.equal(result.status, "parsed");
  assert.deepEqual(result.findings.map(({ code, severity, path: findingPath, line, column }) => ({ code, severity, path: findingPath, line, column })), [
    { code: "COMPOSE-VERSION-OBSOLETE", severity: "Warning", path: "version", line: 1, column: 1 },
  ]);
});

test("isolates YAML failures and rejects duplicate keys and documents", () => {
  for (const name of ["syntax-error.yml", "duplicate-keys.yml", "multiple-documents.yml"]) {
    const result = checkCompose(fixture(name), "");
    assert.equal(result.status, "syntax-invalid", name);
    assert.equal(result.summary, null, name);
    assert.equal(result.findings.some((item) => item.layer === "Compose model"), false, name);
    assert.ok(result.findings[0].line >= 1, name);
  }
  assert.equal(checkCompose(fixture("duplicate-keys.yml"), "").findings[0].code, "YAML-DUPLICATE-KEY");
});

test("normalizes dependencies and rejects explicitly disabled healthchecks", () => {
  const references = checkCompose(fixture("service-references.yml"), "");
  assert.equal(references.summary.dependencyEdges, 2);
  assert.equal(references.findings.find((item) => item.code === "COMPOSE-DEPENDENCY-MISSING")?.path, "services.web.depends_on[1]");

  const health = checkCompose(fixture("dependency-healthcheck.yml"), "");
  assert.equal(health.findings.find((item) => item.code === "COMPOSE-HEALTHCHECK-DISABLED")?.severity, "Error");
  assert.equal(health.findings.some((item) => /healthcheck/i.test(item.message)), true);
});

test("normalizes ports and only flags same-address same-protocol collisions", () => {
  const result = checkCompose(fixture("ports-and-collisions.yml"), "HOST_PORT=9090\n");
  assert.equal(result.summary.publishedPortKeys.includes("*:9090/tcp"), true);
  assert.equal(result.findings.filter((item) => item.code === "COMPOSE-PORT-COLLISION").length, 3);
  assert.equal(result.findings.some((item) => item.path === "services.web.ports[2]" && item.code === "COMPOSE-PORT-COLLISION"), true);
  assert.equal(result.findings.some((item) => item.path === "services.web.ports[3]" && item.code === "COMPOSE-PORT-COLLISION"), false);
});

test("accepts Compose port ranges and bracketed IPv6 bindings", () => {
  const result = checkCompose(fixture("compose-compatible-ports.yml"), "");
  assert.equal(result.status, "parsed");
  assert.equal(result.findings.some((item) => item.code === "COMPOSE-PORT-INVALID"), false);
  assert.ok(result.summary.publishedPortKeys.includes("*:8000-8005/tcp"));
  assert.ok(result.summary.publishedPortKeys.includes("::1:6001/tcp"));
  assert.equal(result.findings.filter((item) => item.code === "COMPOSE-PORT-COLLISION").length, 1);
});

test("keeps interpolation states distinct and never reads env_file", () => {
  const result = checkCompose(fixture("interpolation.yml"), "KNOWN=yes\nEMPTY=\n");
  assert.equal(result.status, "parsed");
  assert.ok(result.summary.interpolationStates.known >= 1);
  assert.ok(result.summary.interpolationStates.defaulted >= 1);
  assert.ok(result.summary.interpolationStates.escaped >= 1);
  assert.ok(result.summary.interpolationStates.unresolved >= 1);
  assert.ok(result.findings.some((item) => item.code === "COMPOSE-ENV-FILE-NOT-READ"));
  assert.ok(result.findings.some((item) => item.code === "COMPOSE-INTERPOLATION-REQUIRED"));
  assert.ok(result.findings.some((item) => item.code === "COMPOSE-INTERPOLATION-ALTERNATIVE"));
});

test("keeps incomplete composition partial and does not fetch missing files", () => {
  const result = checkCompose(fixture("incomplete-composition.yml"), "");
  assert.equal(result.lead, "Cannot fully resolve this file");
  assert.equal(result.completeness.status, "incomplete");
  assert.equal(result.findings.filter((item) => item.code === "COMPOSE-INCOMPLETE-MODEL").length, 2);
  assert.equal(result.findings.find((item) => item.code === "COMPOSE-DEPENDENCY-MISSING")?.severity, "Warning");
});

test("separates static advisories from Compose validity", () => {
  const result = checkCompose(fixture("risk-advisories.yml"), "");
  assert.equal(result.lead, "No blocking static issues found");
  assert.equal(result.counts.errors, 0);
  assert.ok(result.counts.advisories >= 7);
  assert.equal(result.findings.filter((item) => item.severity === "Advisory").length, result.counts.advisories);
  assert.equal(result.findings.some((item) => /secure|safe|compliant|runtime/i.test(item.message)), false);
});

test("enforces input, character, and environment limits before semantic work", () => {
  assert.equal(checkCompose("\0services: {}", "").findings[0].code, "INPUT-CONTROL-CHARACTER");
  assert.equal(checkCompose("services:\n  web:\n    image: nginx\n---\nservices: {}", "").status, "syntax-invalid");
  assert.equal(checkCompose("services: {}", "BROKEN").findings[0].code, "INPUT-ENV-ASSIGNMENT");
  assert.equal(checkCompose("services: {}", "A=1\nA=2").findings[0].code, "INPUT-ENV-DUPLICATE");
  assert.equal(checkCompose("x".repeat(LIMITS.composeBytes + 1), "").findings[0].code, "INPUT-COMPOSE-BYTES");
  assert.equal(checkCompose("services: {}", "x".repeat(LIMITS.environmentBytes + 1)).findings[0].code, "INPUT-ENV-BYTES");
});

test("orders findings and serializes deterministic schema-one reports", () => {
  const result = checkCompose(`${fixture("obsolete-version.yml")}\n`, "");
  const copy = JSON.parse(buildCopyReport(result));
  assert.equal(copy.schemaVersion, 1);
  assert.equal(copy.engineVersion, ENGINE_VERSION);
  assert.deepEqual(copy.diagnostics.map((item) => item.code), result.findings.map((item) => item.code));
  assert.equal(buildCopyReport(result), buildCopyReport(result));
});

test("does not mutate source inputs and is repeat-deterministic", () => {
  const source = fixture("valid-current-compose.yml");
  const environment = "HOST_PORT=8080\n";
  const first = checkCompose(source, environment);
  const second = checkCompose(source, environment);
  assert.deepEqual(first, second);
  assert.equal(source, fixture("valid-current-compose.yml"));
  assert.equal(environment, "HOST_PORT=8080\n");
});

test("rejects unsafe tags, controls, non-mapping roots, and wrong known types", () => {
  const unsafe = checkCompose("services:\n  web:\n    image: !!js/function alert", "");
  assert.equal(unsafe.status, "syntax-invalid");
  assert.equal(unsafe.findings[0].code, "YAML-UNSAFE-TAG");
  assert.equal(checkCompose("services:\n  web:\n    image: nginx\u0001", "").findings[0].code, "INPUT-CONTROL-CHARACTER");
  const root = checkCompose("- service", "");
  assert.equal(root.status, "model-invalid");
  assert.equal(root.lead, "Compose model needs fixing");
  assert.equal(root.findings[0].code, "COMPOSE-ROOT-MAPPING");
  assert.equal(root.findings[0].layer, "Compose model");
  const wrongType = checkCompose("services:\n  web:\n    ports: 8080:80", "");
  assert.equal(wrongType.findings.find((item) => item.code === "COMPOSE-PORTS-TYPE")?.severity, "Error");
});

test("rejects malformed known service fields without rejecting valid network mappings", () => {
  const malformed = checkCompose(fixture("malformed-known-fields.yml"), "");
  assert.equal(malformed.status, "parsed");
  for (const code of ["COMPOSE-IMAGE-TYPE", "COMPOSE-BUILD-TYPE", "COMPOSE-HEALTHCHECK-TYPE", "COMPOSE-ENVIRONMENT-TYPE", "COMPOSE-NETWORKS-TYPE"]) {
    assert.ok(malformed.findings.some((item) => item.code === code), code);
  }
  const mapped = checkCompose(fixture("network-mapping.yml"), "");
  assert.equal(mapped.status, "parsed");
  assert.equal(mapped.findings.some((item) => item.code === "COMPOSE-NETWORKS-TYPE" || item.code === "COMPOSE-NETWORK-MISSING"), false);
});

test("accepts supported env_file mappings and rejects malformed mapping fields", () => {
  const valid = checkCompose(`services:
  web:
    image: nginx:1.27
    env_file:
      - path: ./default.env
        required: false
      - path: ./literal.env
        format: raw`, "");
  assert.equal(valid.findings.some((item) => item.code.startsWith("COMPOSE-ENV-FILE-") && item.severity === "Error"), false);

  const malformed = checkCompose(`services:
  web:
    image: nginx:1.27
    env_file:
      - path: 42
        required: yes
      - format: raw`, "");
  assert.ok(malformed.findings.some((item) => item.code === "COMPOSE-ENV-FILE-PATH"));
  assert.ok(malformed.findings.some((item) => item.code === "COMPOSE-ENV-FILE-REQUIRED"));
});

test("treats image healthchecks as unknown and explicit disabled checks as blocking", () => {
  const imageHealthcheck = checkCompose(`services:
  app:
    image: example/app:1
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:18`, "");
  const unknown = imageHealthcheck.findings.find((item) => item.code === "COMPOSE-HEALTHCHECK-UNVERIFIED");
  assert.equal(unknown?.severity, "Warning");
  assert.equal(imageHealthcheck.counts.errors, 0);

  for (const healthcheck of ["disable: true", 'test: ["NONE"]']) {
    const disabled = checkCompose(`services:
  app:
    image: example/app:1
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:18
    healthcheck:
      ${healthcheck}`, "");
    assert.equal(disabled.findings.find((item) => item.code === "COMPOSE-HEALTHCHECK-DISABLED")?.severity, "Error");
  }
});

test("requires each standalone service to declare an image or build", () => {
  const result = checkCompose("services:\n  web:\n    command: echo hello", "");
  assert.equal(result.findings.find((item) => item.code === "COMPOSE-SERVICE-IMAGE-MISSING")?.severity, "Error");
  assert.equal(result.lead, "Compose model has blocking issues");
});

test("does not turn unresolved interpolation into missing structural references", () => {
  const result = checkCompose(fixture("unknown-structural-interpolation.yml"), "");
  assert.equal(result.status, "parsed");
  assert.ok(result.findings.some((item) => item.code === "COMPOSE-INTERPOLATION-UNRESOLVED"));
  assert.equal(result.findings.some((item) => item.code.endsWith("-MISSING")), false);
});

test("preserves extensions, warns on unsupported keys, and reports resource and profile boundaries", () => {
  const unknown = checkCompose("x-team:\n  owner: platform\nservices:\n  web:\n    image: nginx\n    mystery_key: true\n    ports: \"8080:80\"", "");
  assert.equal(unknown.findings.some((item) => item.code === "COMPOSE-UNKNOWN-KEY"), false);
  assert.equal(unknown.findings.some((item) => item.code === "COMPOSE-SERVICE-UNKNOWN-KEY"), true);
  assert.equal(unknown.findings.some((item) => item.code === "COMPOSE-PORTS-TYPE"), true);
  const resources = checkCompose(fixture("resource-references.yml"), "");
  assert.ok(resources.findings.some((item) => item.code === "COMPOSE-VOLUME-MISSING"));
  assert.ok(resources.findings.some((item) => item.code === "COMPOSE-NETWORK-MISSING"));
  assert.ok(resources.findings.some((item) => item.code === "COMPOSE-SECRET-MISSING"));
  assert.ok(resources.findings.some((item) => item.code === "COMPOSE-CONFIG-MISSING"));
  const profiles = checkCompose(fixture("profiles.yml"), "");
  assert.deepEqual(profiles.summary.profiles, ["debug", "observability"]);
  assert.ok(profiles.findings.some((item) => item.code === "COMPOSE-PROFILE-DUPLICATE"));
  assert.ok(profiles.findings.some((item) => item.code === "COMPOSE-PROFILE-EMPTY"));
});

test("enforces service and line limits without returning a partial model", () => {
  const services = Array.from({ length: 101 }, (_, index) => `  service${index}:\n    image: nginx`).join("\n");
  const tooManyServices = checkCompose(`services:\n${services}`, "");
  assert.equal(tooManyServices.status, "input-invalid");
  assert.equal(tooManyServices.findings[0].code, "INPUT-SERVICES-LIMIT");
  const tooManyLines = `services:\n  web:\n    image: nginx\n${"# line\n".repeat(4_000)}`;
  assert.equal(checkCompose(tooManyLines, "").findings[0].code, "INPUT-COMPOSE-LINES");
});

test("keeps input, syntax, and model failures in separate result states", () => {
  const control = checkCompose("services:\n  web:\n    image: nginx\u0000", "");
  assert.equal(control.status, "input-invalid");
  assert.equal(control.lead, "Input needs attention");
  assert.equal(control.findings[0].layer, "Input");
  assert.equal(control.findings[0].input, "compose");

  const badEnvironment = checkCompose("services: {}", "BAD\u0000");
  assert.equal(badEnvironment.status, "input-invalid");
  assert.equal(badEnvironment.findings[0].code, "INPUT-ENV-CONTROL-CHARACTER");
  assert.equal(badEnvironment.findings[0].input, "environment");

  const syntax = checkCompose(fixture("syntax-error.yml"), "");
  assert.equal(syntax.status, "syntax-invalid");
  assert.equal(syntax.lead, "YAML syntax needs fixing");
});
