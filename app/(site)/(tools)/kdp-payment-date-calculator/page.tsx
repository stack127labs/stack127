import { CalendarClock } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { AppShell } from "../../../ui/site/app-shell";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpPaymentDateCalculator } from "./kdp-payment-date-calculator";

export default async function KdpPaymentDateCalculatorPage() {
  const toolPage = await getRequiredToolPage("kdp-payment-date-calculator");
  return (
    <AppShell mainLabel="KDP payment date calculator">
      <PageCanvas>
        <ToolPageHeader icon={<CalendarClock strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpPaymentDateCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </AppShell>
  );
}
