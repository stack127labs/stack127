import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

export function loadTypeScript(file, imports) {
  const exports = {};
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(code, {
    exports, URL, URLSearchParams, Response,
    require(name) {
      if (Object.hasOwn(imports, name)) return imports[name];
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return exports;
}
