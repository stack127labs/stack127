import type { ReactNode } from "react";
import { Doodle } from "./doodle";
import { dotBandClassName } from "./dot-band";
import styles from "./entry-hero.module.css";

type EntryHeroProps = {
  align?: "center" | "start";
  art: string;
  children: ReactNode;
  wide?: boolean;
};

export function EntryHero({ align = "center", art, children, wide = false }: EntryHeroProps) {
  return (
    <div className={`${dotBandClassName} ${styles.hero}`} data-entry-hero>
      <div className={`${styles.inner} ${wide ? styles.wide : ""} ${align === "start" ? styles.start : ""}`}>{children}</div>
      <Doodle className={styles.art} placement="corner" svg={art} />
    </div>
  );
}
