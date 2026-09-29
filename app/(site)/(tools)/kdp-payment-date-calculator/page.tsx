import { ToolPageShell } from "@/app/ui/catalogs/tool-page-shell";
import { CalendarClock } from "lucide-react";
import { ToolPageHeader, ToolPageMarkdown } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpPaymentDateCalculator } from "./kdp-payment-date-calculator";

export default async function KdpPaymentDateCalculatorPage() {
  const toolPage = await getRequiredToolPage("kdp-payment-date-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<CalendarClock strokeWidth={2.2} />} toolPage={toolPage} />
        <KdpPaymentDateCalculator />
        <ToolPageMarkdown toolPage={toolPage} />
      </PageCanvas>
    </ToolPageShell>
  );
}
