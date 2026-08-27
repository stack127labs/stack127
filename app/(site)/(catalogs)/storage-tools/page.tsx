import {
  Activity,
  ChevronsRight,
  Columns3,
  Database,
  GitBranch,
  HardDrive,
  LayoutGrid,
  Layers3,
  RefreshCw,
  Server,
  ServerCog,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/app/app-shell";
import { PageTitleIcon } from "@/app/page-title-icon";
import { PageHeader } from "@/app/page-header";
import { PageCanvas } from "@/app/page-canvas";
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
      <PageCanvas>
        <PageHeader>
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
        </PageHeader>

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
          <Link className={styles.toolLink} href="/shr-calculator">
            <HardDrive aria-hidden="true" size={24} strokeWidth={2.1} />
            <span>
              <strong>Synology SHR Capacity Calculator</strong>
              <small>
                Estimate fresh-pool capacity for SHR-1 or SHR-2 from individual drive sizes, with
                protection and unused tiers kept separate.
              </small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link className={styles.toolLink} href="/unraid-calculator">
            <Server aria-hidden="true" size={24} strokeWidth={2.1} />
            <span>
              <strong>Unraid Main Array Calculator</strong>
              <small>
                Plan parity and data roles to estimate array capacity and see the parity boundary
                for one future drive.
              </small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link className={styles.toolLink} href="/snapraid-mergerfs-planner">
            <GitBranch aria-hidden="true" size={24} strokeWidth={2.1} />
            <span>
              <strong>SnapRAID and mergerfs Config Planner</strong>
              <small>
                Generate reviewable snapraid.conf and mergerfs /etc/fstab entries from your data,
                parity, content, and pool paths.
              </small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link className={styles.toolLink} href="/drive-reliability">
            <Activity aria-hidden="true" size={24} strokeWidth={2.1} />
            <span>
              <strong>Drive Reliability Explorer</strong>
              <small>
                Inspect observed Backblaze AFR and exposure for an exact drive model or compare up
                to three cohorts.
              </small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link className={styles.toolLink} href="/rebuild-calculator">
            <RefreshCw aria-hidden="true" size={24} strokeWidth={2.1} />
            <span>
              <strong>Rebuild Window and Read-Error Exposure Calculator</strong>
              <small>
                Estimate a simplified degraded rebuild window, source media read, and modeled
                read-error exposure.
              </small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link className={styles.toolLink} href="/ceph-capacity-calculator">
            <ServerCog aria-hidden="true" size={24} strokeWidth={2.1} />
            <span>
              <strong>Ceph Capacity and Failure-Domain Planner</strong>
              <small>
                Model Ceph raw and usable capacity, reserve, and the effect of losing the largest
                named failure domain.
              </small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link className={styles.toolLink} href="/storage-growth-planner">
            <TrendingUp aria-hidden="true" size={24} strokeWidth={2.1} />
            <span>
              <strong>Storage Growth and TCO Planner</strong>
              <small>
                Compare capacity after reserve, the first shortfall year, and modeled total cost
                against data growth.
              </small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
          <Link className={styles.toolLink} href="/storage-layout-advisor">
            <LayoutGrid aria-hidden="true" size={24} strokeWidth={2.1} />
            <span>
              <strong>Storage Layout Advisor</strong>
              <small>
                Compare theoretical layouts from your drives, protected-failure target, and
                workload preference.
              </small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        </section>
      </PageCanvas>
    </AppShell>
  );
}
