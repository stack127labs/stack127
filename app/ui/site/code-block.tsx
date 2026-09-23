"use client";

import { Check, Copy } from "lucide-react";
import { useId, useState } from "react";
import styles from "./code-block.module.css";

type CodeBlockProps = {
  /**
   * Exact text to show and copy. Pass a plain string or a template literal.
   * Do not wrap children in <code> yourself.
   */
  children: string;
  /** Optional short label, e.g. a filename shown above the block. */
  label?: string;
  className?: string;
};

/**
 * Sitewide copyable code snippet.
 * Use for one-liners and multi-line blocks on any page.
 *
 * @example
 * <CodeBlock>ssh user@192.168.1.50</CodeBlock>
 * <CodeBlock label="docker-compose.yml">{`services:\n  app:\n    image: example\n`}</CodeBlock>
 */
export function CodeBlock({ children, label, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const labelId = useId();
  const code = children.replace(/^\n/, "").replace(/\n$/, "");

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Fallback for older browsers / denied clipboard permission.
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className={[styles.block, className].filter(Boolean).join(" ")}>
      {label ? (
        <span className={styles.label} id={labelId}>
          {label}
        </span>
      ) : null}
      <div className={styles.frame}>
        <pre className={styles.pre}>
          <code>{code}</code>
        </pre>
        <button
          aria-describedby={label ? labelId : undefined}
          aria-label={copied ? "Copied" : "Copy code"}
          className={styles.copy}
          onClick={copy}
          type="button"
        >
          {copied ? (
            <Check aria-hidden="true" size={14} strokeWidth={2} />
          ) : (
            <Copy aria-hidden="true" size={14} strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  );
}
