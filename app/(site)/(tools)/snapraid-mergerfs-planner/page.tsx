import { HardDrive } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { StorageToolsSidebar } from "../../storage-tools/storage-tools-sidebar";
import styles from "./snapraid-mergerfs-planner.module.css";
import { SnapraidMergerfsGuide } from "./snapraid-merfs-guide";
import { SnapraidMergerfsPlanner } from "./snapraid-mergerfs-planner";

export default function SnapraidMergerfsPlannerPage() {
  return (
    <AppShell
      mainLabel="SnapRAID and mergerfs config planner"
      menuLabel="Storage tools"
      sidebar={<StorageToolsSidebar active="snapraid-mergerfs" />}
      sidebarLabel="Storage tools sidebar"
    >
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1>
            <PageTitleIcon><HardDrive strokeWidth={2.2} /></PageTitleIcon>{" "}
            SnapRAID and mergerfs <mark>config planner</mark>
          </h1>
          <p>
            Enter data, parity, content, and pool paths to generate a reviewable <code>snapraid.conf</code> and matching mergerfs <code>/etc/fstab</code> line. The checks run in this browser and do not inspect or change your host.
          </p>
        </header>
        <SnapraidMergerfsPlanner />
        <SnapraidMergerfsGuide />
      </div>
    </AppShell>
  );
}
