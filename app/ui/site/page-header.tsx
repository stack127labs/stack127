import type { HTMLAttributes, ReactNode } from "react";
import styles from "./page-header.module.css";

type PageHeaderProps = HTMLAttributes<HTMLElement> & {
  bordered?: boolean;
  children: ReactNode;
};

export function PageHeader({ bordered = false, children, className, ...props }: PageHeaderProps) {
  const classes = [styles.header, bordered ? styles.bordered : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={classes} {...props}>
      {children}
    </header>
  );
}
