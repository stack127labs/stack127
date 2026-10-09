import { BarChart, HeatmapChart, LineChart, PieChart, ScatterChart } from "echarts/charts";
import { AriaComponent, DataZoomComponent, GridComponent, LegendComponent, TooltipComponent, VisualMapComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { SVGRenderer } from "echarts/renderers";

/**
 * The only ECharts entry point. Server and browser both draw through it, and only the chart
 * types listed here are sent to the browser. Add a chart type here before using it.
 * SVG only: our stylesheet recolors the SVG, which canvas can't do.
 */
echarts.use([
  AriaComponent,
  BarChart,
  DataZoomComponent,
  GridComponent,
  HeatmapChart,
  LegendComponent,
  LineChart,
  PieChart,
  ScatterChart,
  SVGRenderer,
  TooltipComponent,
  VisualMapComponent,
]);

/**
 * Chart text is IBM Plex Mono, where every Latin character is 0.6em wide. Measuring that way is exact,
 * needs no canvas or loaded font, and gives the server and the browser the same layout.
 * ECharts can't resolve our font variable, so its own measuring would use a narrower font and clip labels.
 * Wider characters count as 1em: ECharts measures the width of "国" to get the line height.
 */
echarts.setPlatformAPI({
  measureText: (text = "", font = "") => {
    const size = Number(/([\d.]+)px/.exec(font)?.[1] ?? 12);
    let width = 0;
    for (const character of text) width += character.charCodeAt(0) > 0x2000 ? size : size * 0.6;
    return { width } as TextMetrics;
  },
});

export { echarts };
