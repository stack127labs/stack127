import { Route } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { NginxProxyPassCalculator } from "./nginx-proxy-pass-calculator";
import { NginxProxyPassGuide } from "./nginx-proxy-pass-guide";
import styles from "./nginx-proxy-pass-calculator.module.css";

export default function NginxProxyPassCalculatorPage() {
  return (
    <AppShell mainLabel="NGINX proxy_pass URI Calculator">
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1>
            <PageTitleIcon>
              <Route strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            NGINX proxy_pass URI Calculator: <mark>see the upstream URL</mark>
          </h1>
          <p>
            Enter the matched static location, incoming request target, and <code>proxy_pass</code>{" "}
            URL. The calculator returns the final upstream URL with a literal replacement trace and
            optional slash comparison. It runs in this browser, but runtime-dependent cases need
            verification in NGINX.
          </p>
        </header>
        <NginxProxyPassCalculator />
        <NginxProxyPassGuide />
      </div>
    </AppShell>
  );
}
