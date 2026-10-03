import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
const site = path.resolve("app/(site)");
const staticPaths = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) await walk(path.join(directory, entry.name));
    else if (entry.name === "page.tsx") {
      const source = await readFile(path.join(directory, entry.name), "utf8");
      const route = "/" + path.relative(site, directory).split(path.sep).filter(part => !part.startsWith("(")).join("/");
      if (!route.includes("[...")) staticPaths.push(route);
      const target = path.join(directory, "layout.tsx");
      let previous = "";
      try { previous = await readFile(target, "utf8"); } catch(error) { if(error.code !== "ENOENT") throw error; }
      if (previous && !previous.includes("registryLayout") && !/return children;/.test(previous)) throw new Error(`Review the existing layout before registering ${route}`);
      const css = previous.split("\n").filter(line => /^import ["'].*\.css["'];$/.test(line)).join("\n");
      const readsQuery = source.includes("searchParams");
      const dynamicRoute = route.includes("[")
        ? readsQuery ? 'export const dynamic = "force-dynamic";\n' : "export function generateStaticParams() { return []; }\n"
        : "";
      const content = `${css ? css+"\n" : ""}import { registryLayout } from "@/lib/registry-layout";\n\nconst registry = registryLayout(${JSON.stringify(route)});\nexport const generateMetadata = registry.generateMetadata;\n${dynamicRoute}export const revalidate = false;\nexport default registry.Layout;\n`;
      if (previous !== content) await writeFile(target, content);
    }
  }
}
await walk(site);
const routeIndex = path.resolve("lib/registered-site-pages.json");
const routes = JSON.stringify(staticPaths.sort(), null, 2) + "\n";
let previousRoutes = "";
try { previousRoutes = await readFile(routeIndex, "utf8"); } catch (error) { if (error.code !== "ENOENT") throw error; }
if (previousRoutes !== routes) await writeFile(routeIndex, routes);
