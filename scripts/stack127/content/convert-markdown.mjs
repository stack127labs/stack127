import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

const parser = unified().use(remarkParse).use(remarkGfm);
const callouts = { NOTE: 'Note', WARNING: 'Warning', TIP: 'Tip', FORMULA: 'Formula', EXAMPLE: 'Example' };
const sectionMarker = /^<!-- section:([a-z0-9-]+) -->$/;

function fail(source, node, message, lineOffset = 0) {
  throw new Error(`${source}:${(node.position?.start.line ?? 1) + lineOffset}: ${message}`);
}

function attribute(value) {
  return value.replace(/[&"<>\{\}]/g, character => `&#${character.charCodeAt(0)};`);
}

// Preserve Markdown escapes and entities. Code nodes never pass through here.
function escapeText(value) {
  return value
    .replace(/\\[\s\S]|[{}<]/g, match => match.startsWith('\\') ? match : `&#${match.charCodeAt(0)};`)
    .replace(/^(import|export)(?=\s)/gm, word => `&#${word.charCodeAt(0)};${word.slice(1)}`);
}

function applyEdits(markdown, edits) {
  let result = markdown;
  for (const { start, end, value } of edits.sort((a, b) => b.start - a.start)) {
    result = result.slice(0, start) + value + result.slice(end);
  }
  return result;
}

function definitionEntry(node) {
  if (node.type !== 'paragraph' || node.children.length !== 1 || node.children[0].type !== 'text') return null;
  const match = /^([^\n]+)\n:\s+([\s\S]+)$/.exec(node.children[0].value);
  return match ? { term: match[1].trim(), description: match[2].trim() } : null;
}

export function convertMarkdown(markdown, { source = 'Markdown', lineOffset = 0 } = {}) {
  const tree = parser.parse(markdown);
  const edits = [];
  const definitions = new Map();
  function collect(node) {
    if (node.type === 'definition') definitions.set(node.identifier, node);
    node.children?.forEach(collect);
  }
  collect(tree);
  const raw = node => markdown.slice(node.position.start.offset, node.position.end.offset);
  const replace = (node, value) => edits.push({ start: node.position.start.offset, end: node.position.end.offset, value });
  const nested = (text, node, offset = 0) => convertMarkdown(text, {
    source, lineOffset: lineOffset + node.position.start.line - 1 + offset,
  }).trimEnd();
  // Subsequent lines must stay inside an enclosing list or ordinary blockquote.
  const indent = (value, node) => value.replace(/\n/g, `\n${' '.repeat(node.position.start.column - 1)}`);

  function visit(node) {
    if (node.type === 'code') {
      if (/^chart-/.test(node.lang ?? '')) fail(source, node, 'Chart fences need a manual MDX conversion', lineOffset);
      if (!/^(`{3,}|~{3,})/.test(raw(node))) {
        // MDX has no indented code blocks. Add fences without changing the code value.
        const fence = '`'.repeat(Math.max(3, ...Array.from(node.value.matchAll(/`+/g), match => match[0].length + 1)));
        replace(node, indent(`${fence}\n${node.value}\n${fence}`, node));
      }
      return;
    }
    if (node.type === 'inlineCode') return;
    if (node.type === 'html') {
      fail(source, node, node.value.includes('<!--') ? 'Unknown HTML comment' : 'Raw HTML needs a manual MDX conversion', lineOffset);
    }
    if (node.type === 'text') {
      replace(node, escapeText(raw(node)));
      return;
    }
    if (node.type === 'link' && raw(node).startsWith('<')) {
      replace(node, `[${escapeText(node.children.map(child => child.value).join(''))}](${node.url})`);
      return;
    }
    const image = node.type === 'image' ? node : node.type === 'imageReference' ? definitions.get(node.identifier) : null;
    if (image?.url.startsWith('marker-art://')) {
      if (image.title) fail(source, node, 'Marker art image titles need a manual MDX conversion', lineOffset);
      const figure = image.url.slice('marker-art://'.length);
      if (!figure || !node.alt?.trim()) fail(source, node, 'Marker art needs a figure key and alt text', lineOffset);
      replace(node, `<MarkerArt figure="${attribute(figure)}" alt="${attribute(node.alt)}" />`);
      return;
    }
    if (node.type === 'blockquote') {
      const first = node.children[0];
      const text = first?.type === 'paragraph' ? first.children[0] : null;
      const match = text?.type === 'text' && /^\[!(NOTE|WARNING|TIP|FORMULA|EXAMPLE)\](?:[ \t]+([^\n]+))?/.exec(text.value);
      const column = node.position.start.column - 1;
      const unquoted = raw(node).split('\n').map((line, index) => {
        const content = index ? line.slice(Math.min(column, line.match(/^ */)[0].length)) : line;
        return content.replace(/^>[ \t]?/, '');
      });
      if (match) {
        if (text.position.end.line === node.position.start.line && first.children.length > 1) {
          fail(source, node, 'Callout titles with inline formatting need a manual MDX conversion', lineOffset);
        }
        if (match[0].length !== text.value.split('\n')[0].length) {
          fail(source, node, 'Add a space before a callout title or put its body on the next line', lineOffset);
        }
        // The legacy renderer treats the rest of this first line as the title.
        unquoted[0] = '';
        const body = nested(unquoted.slice(1).join('\n'), node, 1).trim();
        const name = callouts[match[1]];
        const title = match[2]?.trim();
        replace(node, indent(`<${name}${title ? ` title="${attribute(title)}"` : ''}>\n\n${body}\n\n</${name}>`, node));
        return;
      }
      const body = nested(unquoted.join('\n'), node);
      replace(node, indent(body.split('\n').map(line => `> ${line}`).join('\n'), node));
      return;
    }
    if (node.children) {
      for (let index = 0; index < node.children.length; index++) {
        const entries = [];
        const first = index;
        while (index < node.children.length) {
          const entry = definitionEntry(node.children[index]);
          if (!entry) break;
          entries.push({ ...entry, node: node.children[index] });
          index++;
        }
        if (entries.length) {
          const start = node.children[first];
          const end = node.children[index - 1];
          const items = entries.map(entry => {
            const description = raw(entry.node).replace(/^[^\n]+\n[ \t]*:\s+/, '');
            return `<Term name="${attribute(entry.term)}">\n\n${nested(description, entry.node, 1)}\n\n</Term>`;
          });
          edits.push({ start: start.position.start.offset, end: end.position.end.offset,
            value: indent(`<Terms>\n\n${items.join('\n\n')}\n\n</Terms>`, start) });
          index--;
        } else visit(node.children[index]);
      }
    }
  }
  visit(tree);
  return `${applyEdits(markdown, edits).trim()}\n`;
}

export function splitDirectorySections(markdown, { source = 'Markdown' } = {}) {
  const tree = parser.parse(markdown);
  const markers = tree.children.filter(node => node.type === 'html' && sectionMarker.test(node.value));
  if (!markers.length) return null;
  if (markdown.slice(0, markers[0].position.start.offset).trim()) {
    fail(source, tree.children[0], 'Content before the first directory section would be lost');
  }
  const sections = [];
  const names = new Set(['intro', 'usage', 'article']);
  for (const [index, node] of markers.entries()) {
    const id = sectionMarker.exec(node.value)[1];
    if (names.has(id)) fail(source, node, `Duplicate or reserved directory section: ${id}`);
    names.add(id);
    const end = markers[index + 1]?.position.start.offset ?? markdown.length;
    const text = markdown.slice(node.position.end.offset, end);
    sections.push({ id, markdown: text, lineOffset: node.position.end.line - 1 });
  }
  return sections;
}

export function pageContentFiles(page) {
  const files = { 'intro.mdx': convertMarkdown(page.intro_markdown, { source: `${page.slug}/intro` }) };
  if (page.page_family === 'tool') {
    if (page.usage_markdown?.trim()) files['usage.mdx'] = convertMarkdown(page.usage_markdown, { source: `${page.slug}/usage` });
    files['article.mdx'] = convertMarkdown(page.content_markdown ?? '', { source: `${page.slug}/article` });
  } else if (page.page_family === 'directory') {
    const source = `${page.slug}/article`;
    const sections = splitDirectorySections(page.content_markdown ?? '', { source });
    if (sections) {
      for (const section of sections) files[`${section.id}.mdx`] = convertMarkdown(section.markdown, { source, lineOffset: section.lineOffset });
    } else files['article.mdx'] = convertMarkdown(page.content_markdown ?? '', { source });
  } else throw new Error(`Unsupported page family: ${page.page_family}`);
  return files;
}
