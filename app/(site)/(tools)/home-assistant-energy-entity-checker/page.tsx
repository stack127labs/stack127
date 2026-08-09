import { Gauge } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { HomeAssistantEnergyGuide } from "./home-assistant-energy-guide";
import { HomeAssistantEnergyEntityChecker } from "./home-assistant-energy-entity-checker";
import styles from "./home-assistant-energy-entity-checker.module.css";

export default function HomeAssistantEnergyEntityCheckerPage() {
  return (
    <AppShell mainLabel="Home Assistant Energy Entity Eligibility Checker">
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1>
            <PageTitleIcon>
              <Gauge strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            Home Assistant Energy Entity Eligibility Checker: <mark>find the failed picker rule</mark>
          </h1>
          <p>
            Choose the intended Home Assistant Energy field, then enter or paste the sensor&apos;s
            current attributes. The checker compares its domain, state, classes, and unit with
            pinned Energy and long-term-statistics rules. It runs in this browser, but it cannot
            inspect recorder health or guarantee that the entity will appear.
          </p>
        </header>
        <HomeAssistantEnergyEntityChecker />
        <HomeAssistantEnergyGuide />
      </div>
    </AppShell>
  );
}
