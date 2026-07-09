import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

export function walk(relativeDir, root = process.cwd()) {
  const absoluteDir = path.join(root, relativeDir);
  if (!existsSync(absoluteDir)) return [];

  const entries = readdirSync(absoluteDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(relativePath, root));
      continue;
    }
    files.push(relativePath);
  }

  return files;
}

export function routeFromPageFile(file) {
  const route = file
    .replace(/^app\/\(site\)/, "")
    .replace(/\/page\.tsx$/, "")
    .replace(/\/$/, "");

  return route || "/";
}

export function docFolderForRoute(route) {
  if (route === "/") return "home";
  return route.split("/").filter(Boolean)[0];
}
