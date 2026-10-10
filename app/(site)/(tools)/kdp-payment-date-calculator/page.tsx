import { ToolPageShell } from "@/app/ui/tools/tool-page-shell";
import { CalendarClock } from "lucide-react";
import { ToolPageArticle, ToolPageHeader } from "@/app/ui/site/tool-page-content";
import { getRequiredToolPage } from "@/lib/tool-pages";
import { PageCanvas } from "../../../ui/site/page-canvas";
import { KdpPaymentDateCalculator } from "./kdp-payment-date-calculator";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import Usage from "./content/usage.mdx";

export default async function KdpPaymentDateCalculatorPage() {
  const toolPage = await getRequiredToolPage("kdp-payment-date-calculator");
  return (
    <ToolPageShell toolPage={toolPage}>
      <PageCanvas>
        <ToolPageHeader icon={<CalendarClock strokeWidth={2.2} />} intro={<Intro />} toolPage={toolPage} />
        <KdpPaymentDateCalculator />
        <ToolPageArticle>
          <Usage />
          <Article />
        </ToolPageArticle>
      </PageCanvas>
    </ToolPageShell>
  );
}
