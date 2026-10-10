import type { HTMLAttributes, ReactNode } from "react";
import type { Breadcrumb } from "@/lib/breadcrumbs";
import { Breadcrumbs } from "./breadcrumbs";
import styles from "./page-header.module.css";

type PageHeaderProps = HTMLAttributes<HTMLElement> & {
  bordered?: boolean;
  /** The trail above the title, from `getBreadcrumbs`. Every page but home has one. */
  breadcrumbs?: Breadcrumb[];
  children: ReactNode;
};

export function PageHeader({ bordered = false, breadcrumbs, children, className, ...props }: PageHeaderProps) {
  const classes = [styles.header, bordered ? styles.bordered : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={classes} {...props}>
      {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
      {children}
    </header>
  );
}
