import { HardDrive } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { PageHeader } from "../../../page-header";
import { PageCanvas } from "../../../page-canvas";
import { StorageToolsSidebar } from "../../(catalogs)/storage-tools/storage-tools-sidebar";
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
      <PageCanvas>
        <PageHeader>
          <h1>
            <PageTitleIcon><HardDrive strokeWidth={2.2} /></PageTitleIcon>{" "}
            SnapRAID and mergerfs <mark>config planner</mark>
          </h1>
          <p>
            Enter data, parity, content, and pool paths to generate a reviewable <code>snapraid.conf</code> and matching mergerfs <code>/etc/fstab</code> line. The checks run in this browser and do not inspect or change your host.
          </p>
        </PageHeader>
        <SnapraidMergerfsPlanner />
        <SnapraidMergerfsGuide />
      </PageCanvas>
    </AppShell>
  );
}
