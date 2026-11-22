import { currentText } from './current-text.mjs';

/** MDX keeps tokens until rendering; course Markdown resolves during its render. */
export default function remarkCurrentText({ markdown = false } = {}) {
  return tree => {
    function visit(parent) {
      if (!parent.children || ['code', 'inlineCode'].includes(parent.type)) return;
      parent.children = parent.children.flatMap(node => {
        if (node.type !== 'text') { visit(node); return [node]; }
        if (markdown) return [{ ...node, value: currentText(node.value) }];
        return node.value.split(/(\[(?:year|month)\])/g).filter(Boolean).map(value =>
          /^\[(year|month)\]$/.test(value)
            ? { type: 'mdxJsxTextElement', name: 'CurrentDateText', attributes: [{ type: 'mdxJsxAttribute', name: 'text', value }], children: [] }
            : { type: 'text', value });
      });
    }
    visit(tree);
  };
}
