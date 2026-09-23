import type { ReactNode } from "react";
import { Doodle } from "./doodle";
import { PageCanvas } from "./page-canvas";
import { dotBandClassName } from "./dot-band";
import styles from "./entry-hero.module.css";

type EntryHeroProps = {
  art: string;
  children: ReactNode;
};

export function EntryHero({ art, children }: EntryHeroProps) {
  return (
    <PageCanvas flow className={dotBandClassName} data-entry-hero>
      <div className={styles.inner}>{children}</div>
      <Doodle className={styles.art} placement="corner" svg={art} />
    </PageCanvas>
  );
}
