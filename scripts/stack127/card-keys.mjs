import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Read the registry's object keys without importing React or the SVG modules.
function registryKeys(file, name) {
  const source = ts.createSourceFile(file.pathname, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== name) continue;
      if (!declaration.initializer || !ts.isObjectLiteralExpression(declaration.initializer)) break;
      return new Set(declaration.initializer.properties.map(property => {
        if (!ts.isPropertyAssignment(property) || (!ts.isIdentifier(property.name) && !ts.isStringLiteral(property.name))) {
          throw new Error(`Unsupported card registry entry in ${file.pathname}`);
        }
        return property.name.text;
      }));
    }
  }
  throw new Error(`Card registry is missing in ${file.pathname}`);
}

const iconKeys = registryKeys(new URL('../../lib/card-icons.ts', import.meta.url), 'icons');
const artKeys = registryKeys(new URL('../../lib/card-art.ts', import.meta.url), 'art');

export function validateCardKey(field, key) {
  const keys = field === 'card_icon_key' ? iconKeys : field === 'card_art_key' ? artKeys : null;
  if (!keys) throw new Error(`Unknown card field: ${field}`);
  if (!keys.has(key)) throw new Error(`Unknown ${field}: ${key}`);
  return key;
}
