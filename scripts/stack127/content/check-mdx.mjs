#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import { allowedContentComponents } from './allowed-components.mjs';

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMdx);
const allowed = new Set(allowedContentComponents);

export function checkMdx(markdown, file = 'content.mdx') {
  const errors = [];
  const report = (node, message) => errors.push(`${file}:${node.position?.start.line ?? 1}: ${message}`);
  let tree;
  try { tree = parser.parse(markdown); }
  catch (error) {
    return [`${file}:${error.line ?? error.place?.start?.line ?? error.place?.line ?? 1}: Invalid MDX: ${error.reason ?? error.message}`];
  }
  let previousDepth = 1;
  function visit(node) {
    if (node.type === 'heading') {
      if (node.depth === 1) report(node, 'Content cannot have an h1');
      else if (node.depth > previousDepth + 1) report(node, `Heading skips a level from h${previousDepth} to h${node.depth}`);
      previousDepth = node.depth;
    }
    if (node.type === 'mdxjsEsm') report(node, 'Content cannot import or export');
    if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
      if (!node.name || /^[a-z]/.test(node.name)) report(node, 'Raw HTML tags and JSX fragments are not allowed');
      else if (!allowed.has(node.name)) report(node, `Component is not allowed: ${node.name}`);
      for (const attribute of node.attributes) {
        if (attribute.type === 'mdxJsxExpressionAttribute') report(attribute, 'Spread attributes cannot be checked; use named properties');
        if (['style', 'className'].includes(attribute.name)) report(attribute, `${attribute.name}= is not allowed in content`);
      }
    }
    node.children?.forEach(visit);
  }
  visit(tree);
  return errors;
}

export async function findContentFiles(root = 'app') {
  const files = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.name.endsWith('.mdx') && path.basename(directory) === 'content') files.push(file);
    }
  }
  await walk(root);
  return files.sort();
}

export async function checkContentFiles(root = 'app') {
  const errors = [];
  for (const file of await findContentFiles(root)) errors.push(...checkMdx(await readFile(file, 'utf8'), file));
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const errors = await checkContentFiles();
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else console.log('MDX content check passed');
}
