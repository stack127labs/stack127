import { ChevronsRight, Columns3, Database, HardDrive, Layers3 } from "lucide-react";
import Link from "next/link";
import { AppShell } from "../../app-shell";
import { PageTitleIcon } from "../../page-title-icon";
import { StorageToolsSidebar } from "./storage-tools-sidebar";
import styles from "./storage-tools.module.css";

export default function StorageToolsPage() {
  return (
    <AppShell
      mainLabel="Storage tools"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="hub" />}
      sidebarLabel="Storage tools sidebar"
    >
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1>
            <PageTitleIcon>
              <Layers3 strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            Storage <mark>tools</mark> for planning arrays before buying drives
          </h1>
          <p>
            Calculate capacity from the drives and topology you actually plan to use. Each tool
            keeps theoretical capacity, implementation estimates, and observed data separate.
          </p>
        </header>

        <section aria-labelledby="available-storage-tools" className={styles.hubSection}>
          <h2 id="available-storage-tools">Start with the array layout</h2>
          <Link className={styles.toolLink} href="/raid-calculator">
            <HardDrive aria-hidden="true" size={24} strokeWidth={2.1} />
            <span>
              <strong>RAID Capacity and Level Explorer</strong>
              <small>
                Compare conventional RAID capacity, mixed-drive waste, explicit nested groups,
                and failure boundaries.
              </small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link className={styles.toolLink} href="/zfs-capacity-calculator">
            <Database aria-hidden="true" size={24} strokeWidth={2.1} />
            <span>
              <strong>ZFS Pool Capacity Calculator</strong>
              <small>
                Model mixed vdevs, RAIDZ allocation, slop, auxiliary roles, and planning headroom.
              </small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link className={styles.toolLink} href="/zfs-padding-calculator">
            <Columns3 aria-hidden="true" size={24} strokeWidth={2.1} />
            <span>
              <strong>ZFS Block Size and Padding Calculator</strong>
              <small>Inspect data, parity, and padding per block.</small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link className={styles.toolLink} href="/raidz-expansion-planner">
            <ChevronsRight aria-hidden="true" size={24} strokeWidth={2.1} />
            <span>
              <strong>RAIDZ Expansion Planner</strong>
              <small>Compare each one-disk width change.</small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
