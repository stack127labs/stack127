import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
const site = path.resolve("app/(site)");
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) await walk(path.join(directory, entry.name));
    else if (entry.name === "page.tsx") {
      const source = await readFile(path.join(directory, entry.name), "utf8");
      const route = "/" + path.relative(site, directory).split(path.sep).filter(part => !part.startsWith("(")).join("/");
      const target = path.join(directory, "layout.tsx");
      let previous = "";
      try { previous = await readFile(target, "utf8"); } catch(error) { if(error.code !== "ENOENT") throw error; }
      if (previous && !previous.includes("registryLayout") && !/return children;/.test(previous)) throw new Error(`Review the existing layout before registering ${route}`);
      const css = previous.split("\n").filter(line => /^import ["'].*\.css["'];$/.test(line)).join("\n");
      const content = `${css ? css+"\n" : ""}import { registryLayout } from "@/lib/registry-layout";\n\nconst registry = registryLayout(${JSON.stringify(route)}, ${source.includes("searchParams")});\nexport const generateMetadata = registry.generateMetadata;\n${route.includes("[") ? "export function generateStaticParams() { return []; }\n" : ""}export const revalidate = ${route === "/" ? 86400 : 604800};\nexport default registry.Layout;\n`;
      if (previous !== content) await writeFile(target, content);
    }
  }
}
await walk(site);
