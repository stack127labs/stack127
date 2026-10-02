import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const strict = process.argv.includes("--strict");
const sourceOnly = process.argv.includes("--source-only");
const dist = process.env.STACK127_TEST_DIST_DIR ?? ".next";
const allowed = route => route === "/api" || route.startsWith("/api/") ||
  route === "/vitals" || route.startsWith("/vitals/") || route === "/publication-not-found";
const sourceProblems = [];
const buildProblems = [];
let dynamicPages = [];
let buildRead = false;

if (!sourceOnly) try {
  const [appRoutes, prerender] = await Promise.all([
    readFile(path.join(dist, "app-path-routes-manifest.json"), "utf8").then(JSON.parse),
    readFile(path.join(dist, "prerender-manifest.json"), "utf8").then(JSON.parse),
  ]);
  const pageRoutes = [...new Set(Object.entries(appRoutes)
    .filter(([appPath]) => appPath.endsWith("/page"))
    .map(([, route]) => route))].sort();
  // A parameterized route in dynamicRoutes is prerendered with static params.
  // The name of that manifest section does not mean it renders per request.
  dynamicPages = pageRoutes.filter(route => !Object.hasOwn(prerender.routes, route) &&
    !Object.hasOwn(prerender.dynamicRoutes, route));
  for (const [route, entry] of Object.entries({ ...prerender.routes, ...prerender.dynamicRoutes })) {
    if (!allowed(route) && typeof entry.initialRevalidateSeconds === "number" && entry.initialRevalidateSeconds > 0) {
      buildProblems.push(`${route}: timed revalidate = ${entry.initialRevalidateSeconds}`);
    }
    if (!allowed(route) && entry.initialRevalidateSeconds === 0) {
      buildProblems.push(`${route}: dynamic revalidate = 0`);
    }
    if (!allowed(route) && typeof entry.fallbackRevalidate === "number" && entry.fallbackRevalidate > 0) {
      buildProblems.push(`${route}: timed fallback revalidate = ${entry.fallbackRevalidate}`);
    }
    if (!allowed(route) && entry.fallbackRevalidate === 0) {
      buildProblems.push(`${route}: dynamic fallback revalidate = 0`);
    }
  }
  buildRead = true;
} catch (error) {
  buildProblems.push(`Cannot read build manifests in ${dist}. Run npm run build first. ${error.message}`);
}

function publicPath(file) {
  const parts = path.relative("app", path.dirname(file)).split(path.sep)
    .filter(part => !part.startsWith("(") && !part.startsWith("@"));
  return "/" + parts.join("/");
}

async function scan(file) {
  if (allowed(publicPath(file))) return;
  const text = await readFile(file, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true,
    /\.[jt]sx$/.test(file) ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const isClient = source.statements.some(statement => ts.isExpressionStatement(statement) &&
    ts.isStringLiteral(statement.expression) && statement.expression.text === "use client");
  const requests = new Map();
  const namespaces = new Set();
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement) || statement.moduleSpecifier.text !== "next/headers") continue;
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings)) namespaces.add(bindings.name.text);
    if (bindings && ts.isNamedImports(bindings)) {
      for (const binding of bindings.elements) {
        const original = (binding.propertyName ?? binding.name).text;
        if (original === "headers" || original === "cookies") requests.set(binding.name.text, original);
      }
    }
  }
  const found = new Map();
  const record = (node, reason) => {
    if (!found.has(reason)) found.set(reason, source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1);
  };
  const pageOrLayout = /(?:page|layout)\.[cm]?[jt]sx?$/.test(file);
  const visit = (node, inMetadata = false) => {
    if (ts.isTypeNode(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) return;
    const metadata = inMetadata || ((ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node)) &&
      node.name && ts.isIdentifier(node.name) && node.name.text === "generateMetadata");
    if (ts.isVariableStatement(node) && node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
      for (const declaration of node.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
        const value = declaration.initializer;
        if (declaration.name.text === "dynamic" && ts.isStringLiteral(value) && value.text === "force-dynamic") {
          record(declaration, 'dynamic = "force-dynamic"');
        }
        if (declaration.name.text === "revalidate" && ts.isNumericLiteral(value) && Number(value.text) > 0) {
          record(declaration, `timed revalidate = ${value.text}`);
        }
        if (declaration.name.text === "revalidate" && ts.isNumericLiteral(value) && Number(value.text) === 0) {
          record(declaration, "dynamic revalidate = 0");
        }
      }
    }
    if (!isClient && (pageOrLayout || metadata)) {
      if (ts.isIdentifier(node) && node.text === "searchParams") record(node, "server searchParams");
      if (ts.isCallExpression(node)) {
        const callee = node.expression;
        let name;
        if (ts.isIdentifier(callee)) name = requests.get(callee.text) ??
          (["headers", "cookies"].includes(callee.text) ? callee.text : undefined);
        if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression) &&
          namespaces.has(callee.expression.text) && ["headers", "cookies"].includes(callee.name.text)) name = callee.name.text;
        if (name) record(node, `server ${name}()`);
      }
    }
    ts.forEachChild(node, child => visit(child, metadata));
  };
  visit(source);
  for (const [reason, line] of found) sourceProblems.push(`${file}:${line}: ${reason}`);
}

async function walk(directory) {
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (/^(?:page|layout|route|sitemap|robots)\.[cm]?[jt]sx?$/.test(entry.name)) await scan(file);
  }
}

await walk("app");
const blockedDynamic = dynamicPages.filter(route => !allowed(route));
console.log(`Static route report (${strict ? "strict" : "report only"})`);
console.log(`Build manifests: ${sourceOnly ? "checked after the image build" : dist}`);
console.log(`Dynamic page routes: ${buildRead ? dynamicPages.length : "not checked"}`);
for (const route of dynamicPages) console.log(`  ${route}${allowed(route) ? " (allowed)" : ""}`);
console.log(`Dynamic page problems: ${blockedDynamic.length}`);
console.log(`Build cache problems: ${buildProblems.length}`);
for (const problem of buildProblems) console.log(`  ${problem}`);
console.log(`Source problems: ${sourceProblems.length}`);
for (const problem of sourceProblems) console.log(`  ${problem}`);
const problems = blockedDynamic.length + buildProblems.length + sourceProblems.length;
console.log(`Total problems: ${problems}`);
console.log(strict ? `Strict ${sourceOnly ? "source " : ""}check ${problems ? "failed" : "passed"}.` : "Report only. Use --strict for the release gate.");
if (strict && problems) process.exitCode = 1;
