import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { routeParameters } from "./assets.mjs";

export function pageRoute(file) {
  return "/" + path.dirname(file).split(path.sep).slice(1)
    .filter(part => !part.startsWith("(")).join("/");
}

export function replaceStaticParameters(source, parameters, file) {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const existing = tree.statements.find(statement => ts.isFunctionDeclaration(statement) && statement.name?.text === "generateStaticParams");
  if (existing) source = source.slice(0, existing.getFullStart()) + source.slice(existing.end);
  if (/export\s+const\s+generateStaticParams/.test(source)) throw new Error(`Review the static parameter declaration in ${file}`);
  return `${source}\nexport const dynamicParams = false;\nexport function generateStaticParams() { return ${JSON.stringify(parameters)}; }\n`;
}

export async function prepareFrontend(source, target, pages) {
  // Copy only explicit build inputs. No credentials, git state, or server output.
  await mkdir(target, { recursive: true });
  for (const file of ["app", "lib", "public", "next.config.ts", "next-env.d.ts", "tsconfig.json", "package.json", "package-lock.json"]) {
    await cp(path.join(source, file), path.join(target, file), { recursive: true });
  }
  // Turbopack requires dependencies inside its root. Reflink where supported;
  // otherwise copy files. Dereference links so they cannot escape the export.
  await cp(path.join(source, "node_modules"), path.join(target, "node_modules"), {
    recursive: true, dereference: true, mode: constants.COPYFILE_FICLONE,
  });
  for (const route of ["app/api", "app/vitals", "app/publication-not-found"]) {
    await rm(path.join(target, route), { recursive: true, force: true });
  }
  const published = new Set(pages.map(page => page.slug ? `/${page.slug}` : "/"));
  const rendered = new Set();
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.name === "page.tsx") {
        const relative = path.relative(target, file);
        const route = pageRoute(relative);
        if (route.includes("[")) {
          const parameters = routeParameters(route, pages);
          if (!parameters.length) {
            await rm(file);
            await rm(path.join(directory, "layout.tsx"), { force: true });
            continue;
          }
          await writeFile(file, replaceStaticParameters(await readFile(file, "utf8"), parameters, relative));
          // Generated route layouts normally contain an empty fallback list.
          const layout = path.join(directory, "layout.tsx");
          const source = await readFile(layout, "utf8");
          await writeFile(layout, source.replace(/export function generateStaticParams\(\) \{ return \[\]; \}\n/, ""));
          for (const values of parameters) rendered.add(route.replace(/\[([^\]]+)\]/g, (_, key) => values[key]));
        } else if (!published.has(route)) {
          await rm(file);
          // Keep route group layouts, but a removed page's registry guard must go.
          const layout = path.join(directory, "layout.tsx");
          const text = await readFile(layout, "utf8").catch(error => { if (error.code === "ENOENT") return ""; throw error; });
          if (text.includes("registryLayout(")) await rm(layout);
        } else rendered.add(route);
      }
    }
  }
  await walk(path.join(target, "app/(site)"));
  for (const route of published) if (!rendered.has(route)) throw new Error(`Published page has no exportable source: ${route}`);
  return { pages: rendered.size };
}
