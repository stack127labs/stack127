import path from "node:path";
import ts from "typescript";

const geometry = /^(?:margin|padding)(?:-|$)|^(?:width|min-width|max-width)$/;

/** Keep outer geometry in PageCanvas; page classes may still own their internal layout. */
export function pageLayoutFailures(sources, styles) {
  const failures = [];
  const ownedClasses = [];
  for (const [file, source] of sources) {
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const imports = new Map();
    for (const node of ast.statements) {
      if (ts.isImportDeclaration(node) && node.importClause?.name && ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text.endsWith('.module.css')) {
        const target = node.moduleSpecifier.text;
        imports.set(node.importClause.name.text, target.startsWith('@/') ? target.slice(2) : path.posix.normalize(path.posix.join(path.posix.dirname(file), target)));
      }
    }
    function visit(node, parentFrame = false, shellChild = false) {
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        const open = ts.isJsxElement(node) ? node.openingElement : node;
        const tag = open.tagName.getText(ast);
        const frame = tag === 'PageCanvas';
        if (shellChild && /^[a-z]/.test(tag) && !['script','style'].includes(tag)) failures.push(`${file}: use PageCanvas for the ${tag} directly inside AppShell.`);
        if ((frame || tag === 'EntryHero') && parentFrame) failures.push(`${file}: nested PageCanvas applies page gutters twice.`);
        if (frame || tag === 'EntryHero') {
          for (const attr of open.attributes.properties) {
            if (!ts.isJsxAttribute(attr)) continue;
            if (['wide','align'].includes(attr.name.text)) failures.push(`${file}: ${tag} no longer accepts ${attr.name.text}; use the shared canvas widths.`);
            if (tag === 'EntryHero' && attr.name.text === 'reading') failures.push(`${file}: EntryHero stays wide; limit its text through PageHeader.`);
            if (attr.name.text === 'style' && /(?:width|maxWidth|minWidth|margin\w*|padding\w*)\s*:/.test(attr.initializer?.getText(ast) ?? '')) failures.push(`${file}: inline page geometry belongs in PageCanvas.`);
            if (attr.name.text !== 'className' || !attr.initializer) continue;
            const value = attr.initializer.getText(ast);
            for (const match of value.matchAll(/\b(\w+)\.(\w+)/g)) {
              if (imports.has(match[1])) ownedClasses.push({file, css: imports.get(match[1]), name: match[2]});
            }
            const literals = ts.isStringLiteral(attr.initializer) ? attr.initializer.text : value.replace(/\$\{[^}]*\}/g, '').replace(/^[{`]+'?|[}`]+$/g, '');
            for (const name of literals.split(/\s+/).filter(name => /^[a-z][a-z0-9-]*$/.test(name))) ownedClasses.push({file, css:null, name});
          }
        }
        if (ts.isJsxElement(node)) for (const child of node.children) visit(child, parentFrame || frame || tag === 'EntryHero', tag === 'AppShell');
        return;
      }
      ts.forEachChild(node, child => visit(child, parentFrame, shellChild));
    }
    visit(ast);
  }
  for (const {file,css,name} of ownedClasses) {
    for (const [cssFile,source] of styles) {
      if (css ? cssFile !== css : cssFile.endsWith('.module.css')) continue;
      const clean = source.replace(/\/\*[\s\S]*?\*\//g, '');
      for (const match of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        if (!match[1].split(',').some(selector => new RegExp(`(?:^|[\\s>+~])\\.${name}(?::[\\w()-]+)?$`).test(selector.trim()))) continue;
        for (const declaration of match[2].split(';')) {
          const property = declaration.split(':')[0].trim();
          if (geometry.test(property)) failures.push(`${cssFile}: .${name} overrides ${property} on a PageCanvas used by ${file}.`);
        }
      }
    }
  }
  return [...new Set(failures)];
}
