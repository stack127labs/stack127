import type { UiChartSpec } from "./chart-option";
import { UiLiveChart } from "./chart-client";
import { renderChartSvg } from "./chart-static";

/**
 * An interactive chart on a page. The server draws it as SVG, so it shows before scripts run and
 * search engines see it. The browser then adds hover, line toggles, and range controls.
 * For a chart nobody needs to interact with, use UiStaticChart from ./chart-static, which sends no script.
 */
export function UiChart({ spec }: { spec: UiChartSpec }) {
  return <UiLiveChart spec={spec} svg={renderChartSvg(spec)} />;
}
