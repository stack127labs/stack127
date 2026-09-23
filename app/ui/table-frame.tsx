import type { ReactNode } from "react";
import styles from "./table-frame.module.css";

export function TableFrame({ ariaLabel, children, className = "" }: {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
}) {
  return <div aria-label={ariaLabel} className={`${styles.frame} ${className}`} role="region" tabIndex={0}>{children}</div>;
}
