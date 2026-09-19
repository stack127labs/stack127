import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { validateSpec } from "../marker-art/lint.mjs";

const MARKER_SCHEME = /marker-art:\/\/[^\s)"']+/g;
const MARKER_IMAGE = /!\[([^\]]*)\]\((marker-art:\/\/[^\s)]+)\)/g;

export function validateToolMarkdown(markdownValues, { repositoryRoot = process.cwd() } = {}) {
  const registryPath = resolve(repositoryRoot, "app/marker-art-registry.json");
  const registry = JSON.parse(readFileSync(registryPath, "utf8"));
  const errors = [];

  for (const [label, markdown] of Object.entries(markdownValues)) {
    const imageReferences = new Map(
      [...markdown.matchAll(MARKER_IMAGE)].map((match) => [match[2], match[1].trim()]),
    );
    for (const reference of markdown.match(MARKER_SCHEME) ?? []) {
      const id = reference.slice("marker-art://".length);
      if (!/^[a-z0-9]+(?:\/[a-z0-9-]+)?$/.test(id)) {
        errors.push(`${label}: malformed marker art reference ${reference}`);
        continue;
      }
      const definition = registry[id];
      if (!definition) {
        errors.push(`${label}: unknown marker art reference ${reference}`);
        continue;
      }
      if (!imageReferences.has(reference)) {
        errors.push(`${label}: marker art must use Markdown image syntax with a caption: ${reference}`);
      } else if (!imageReferences.get(reference)) {
        errors.push(`${label}: marker art requires a useful caption: ${reference}`);
      }
      for (const property of ["specPath", "artifactPath"]) {
        const path = resolve(repositoryRoot, definition[property]);
        if (!existsSync(path) || !statSync(path).isFile()) {
          errors.push(`${label}: marker registry ${id} has a missing ${property}`);
        }
      }
      const specPath = resolve(repositoryRoot, definition.specPath);
      if (existsSync(specPath)) {
        try {
          const spec = JSON.parse(readFileSync(specPath, "utf8"));
          const lint = validateSpec(spec, definition.specPath);
          errors.push(...lint.errors.map((error) => `${label}: ${error}`));
          if (spec.id !== id.replace("/", "--")) {
            errors.push(`${label}: marker registry ${id} does not match spec id ${spec.id ?? "(missing)"}`);
          }
          if (!readFileSync(resolve(repositoryRoot, definition.artifactPath), "utf8").includes(spec.id)) {
            errors.push(`${label}: marker registry ${id} artifact does not identify the registered spec`);
          }
        } catch {
          errors.push(`${label}: marker registry ${id} has invalid spec JSON`);
        }
      }
    }
  }
  if (errors.length) throw new Error(errors.join("\n"));
}
