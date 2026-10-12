import { FunnelChart, GaugeChart, RadarChart, SankeyChart, TreemapChart } from "echarts/charts";
import { RadarComponent } from "echarts/components";
import { echarts } from "./echarts";

/**
 * Chart types beyond the common set. The server always registers them. The browser loads this
 * file only for a chart that needs one, so pages with ordinary charts don't carry their weight.
 * Add a new ECharts type here, or in echarts.ts when most chart pages will use it.
 */
echarts.use([FunnelChart, GaugeChart, RadarChart, RadarComponent, SankeyChart, TreemapChart]);
