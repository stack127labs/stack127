import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import styles from "./tool-workbench.module.css";

/**
 * The band every tool sits in: a full-width surface, the shared 66rem working width, and the
 * spacing between the form and the result. Tools put their form and `ToolResult` inside it
 * instead of writing their own workbench, width, or gaps.
 */
export function ToolWorkbench({ children, label }: { children: ReactNode; label: string }) {
  return (
    <section aria-label={label} className={styles.workbench} data-tool-workbench>
      <div className={styles.content}>{children}</div>
    </section>
  );
}

/** Fields that belong to one decision. They share a row on wide screens and stack on phones. */
export function ToolFieldRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.fieldRow} ${className}`}>{children}</div>;
}

/**
 * The result region, below one divider. It keeps its place in the layout in every state, so the
 * page never jumps when a result appears, goes stale, or can't be calculated.
 */
export function ToolResult({
  children,
  className = "",
  label,
  ref,
  stale = false,
  ...props
}: Omit<ComponentPropsWithoutRef<"section">, "aria-label"> & {
  children: ReactNode;
  label: string;
  ref?: Ref<HTMLElement>;
  /** The inputs changed since this result was calculated. */
  stale?: boolean;
}) {
  return (
    <section {...props} aria-label={label} className={`${styles.result} ${className}`} data-stale={stale || undefined} ref={ref}>
      {children}
    </section>
  );
}
