import Link from "next/link";
import { proseClassName, proseFlowClassName } from "../../../prose";
import styles from "./shr-calculator.module.css";

export function ShrGuide() {
  return (
    <article className={`${styles.guide} ${proseClassName} ${proseFlowClassName}`}>
      <h2>Read the capacity bands</h2>
      <p>
        Mixed drive sizes create separate capacity bands. The table shows how many drives reach each
        band and splits it into data, protection, or unused space. In SHR-2, a higher band reached
        by too few drives cannot form two protection slices, so it stays unused. The modeled system
        reserve is separate from both protection and unused space.
      </p>

      <h2>Treat this as a fresh-pool estimate</h2>
      <p>
        The calculator converts each entry to exact bytes and models a new pool. It does not predict
        filesystem metadata, snapshots, quotas, fragmentation, rebuild state, expansion history, or
        application-visible free space. Synology's <a href="https://www.synology.com/en-uk/support/RAID_calculator">RAID calculator</a>
        {" "}notes an approximate 10 GB system and swap reservation per drive; this page keeps that
        reserve separate and does not add a filesystem deduction.
      </p>

      <h2>Verify the layout before you build</h2>
      <p>
        Use the marketed capacity printed for each intended drive, then compare the chosen mode and
        unit with the target NAS and <a href="https://kb.synology.com/en-uk/DSM/tutorial/What_RAID_type_is_best_for_my_storage">Synology's RAID guidance</a>.
        If your question is conventional RAID rather than SHR, use the <Link href="/raid-calculator">RAID calculator</Link>.
        The calculator stays in your browser. The URL stays clean until you choose Share, which puts the mode
        and drive capacities into a shareable URL. That URL is not a secret. For another storage
        planning task, <Link href="/storage-tools">browse the storage tools</Link>.
      </p>
    </article>
  );
}
