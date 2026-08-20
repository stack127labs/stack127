import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const exampleFiles = [
  ".env.analytics.example",
  ".env.database.example",
  ".env.deploy.example",
  ".env.homelab.example",
  ".env.local.example",
  ".env.repos.example",
];

function parseAssignments(text) {
  return text
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const separator = line.indexOf("=");
      assert.ok(separator > 0, `Expected an environment assignment: ${line}`);
      return [line.slice(0, separator), line.slice(separator + 1)];
    });
}

test("every local environment concern has a tracked secret-free schema", async () => {
  const inventory = await readFile("stack127_docs/environment-inventory.md", "utf8");
  const allowedDefaults = new Map([
    ["STACK127_GITHUB_ORG", "stack127labs"],
    ["STACK127_DATASET_REPO", "stack127-datasets"],
  ]);

  for (const file of exampleFiles) {
    const assignments = parseAssignments(await readFile(file, "utf8"));
    assert.ok(inventory.includes(file), `${file} is missing from the inventory`);

    for (const [key, value] of assignments) {
      assert.match(inventory, new RegExp(`\\b${key}\\b`));
      const isDeploymentIdentity =
        file === ".env.deploy.example" &&
        (key.startsWith("STACK127_PRODUCTION_") || key === "DOKPLOY_LOCAL_URL");
      if (isDeploymentIdentity) {
        assert.notEqual(value, "", `${key} should keep its non-secret production identity default`);
        continue;
      }
      assert.equal(
        value,
        allowedDefaults.get(key) ?? "",
        `${file} must not contain a secret or an undocumented default for ${key}`,
      );
    }
  }
});

test("the inventory covers every named GitHub Actions secret and variable", async () => {
  const inventory = await readFile("stack127_docs/environment-inventory.md", "utf8");
  const workflowFiles = (await readdir(".github/workflows"))
    .filter((file) => file.endsWith(".yml") || file.endsWith(".yaml"));
  const references = new Set();

  for (const file of workflowFiles) {
    const workflow = await readFile(`.github/workflows/${file}`, "utf8");
    for (const match of workflow.matchAll(/\b(?:secrets|vars)\.([A-Z0-9_]+)/gu)) {
      references.add(match[1]);
    }
  }

  for (const name of references) {
    assert.match(inventory, new RegExp(`\\b${name}\\b`), `${name} is missing from the inventory`);
  }
});
