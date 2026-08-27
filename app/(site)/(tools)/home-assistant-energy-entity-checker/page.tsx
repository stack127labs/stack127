import { Gauge } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { PageHeader } from "../../../page-header";
import { PageCanvas } from "../../../page-canvas";
import { HomeAssistantEnergyGuide } from "./home-assistant-energy-guide";
import { HomeAssistantEnergyEntityChecker } from "./home-assistant-energy-entity-checker";

export default function HomeAssistantEnergyEntityCheckerPage() {
  return (
    <AppShell mainLabel="Home Assistant Energy Entity Eligibility Checker">
      <PageCanvas>
        <PageHeader>
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
        </PageHeader>
        <HomeAssistantEnergyEntityChecker />
        <HomeAssistantEnergyGuide />
      </PageCanvas>
    </AppShell>
  );
}
