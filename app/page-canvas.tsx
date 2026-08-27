import type { HTMLAttributes, ReactNode } from "react";
import styles from "./page-canvas.module.css";

type PageCanvasProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  wide?: boolean;
};

export function PageCanvas({ children, className, wide = false, ...props }: PageCanvasProps) {
  const classes = [styles.canvas, wide ? styles.wide : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
