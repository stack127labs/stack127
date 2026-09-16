import type { HTMLAttributes, ReactNode } from "react";
import styles from "./page-canvas.module.css";

type PageCanvasProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "main" | "article" | "section";
  children: ReactNode;
  flow?: boolean;
  reading?: boolean;
};

export function PageCanvas({
  as: Tag = "div",
  children,
  className,
  flow = false,
  reading = false,
  ...props
}: PageCanvasProps) {
  const classes = [styles.frame, reading ? styles.reading : "", flow ? "" : styles.grid, className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      className={classes}
      data-page-canvas
      data-page-width={reading ? "reading" : "wide"}
      {...props}
    >
      {children}
    </Tag>
  );
}
