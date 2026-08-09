import { ShieldCheck } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { NfsFirewallRulesGuide } from "./nfs-firewall-rules-guide";
import { NfsFirewallRulesPlanner } from "./nfs-firewall-rules-planner";
import styles from "./nfs-firewall-rules.module.css";

export default function NfsFirewallRulesPage() {
  return (
    <AppShell mainLabel="NFS Firewall Rules Planner">
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1>
            <PageTitleIcon><ShieldCheck strokeWidth={2.2} /></PageTitleIcon>{" "}
            NFS Firewall <mark>Rules Planner</mark>
          </h1>
          <p>
            Build a reviewable inbound-listener plan for one Linux NFS server or client. Choose the
            NFS version, peer CIDR, and firewall, then enter any locally verified listener ports the
            selected branch needs. The calculation runs in this browser and does not inspect your
            hosts or apply rules.
          </p>
        </header>
        <NfsFirewallRulesPlanner />
        <NfsFirewallRulesGuide />
      </div>
    </AppShell>
  );
}
