import { chartLegend, chartOption, donutTotal, hasChartTable, type UiChartSpec } from "./chart-option";
import { ChartDataTable, ChartHeading } from "./chart-parts";
import { echarts } from "./echarts";
import styles from "./charts.module.css";

/** Server drawing widths: the wide content column, the reading column, and a phone. */
const wideWidth = 1080;
const proseWidth = 760;
const phoneWidth = 360;

export function renderChartSvg(spec: UiChartSpec, width = wideWidth) {
  const chart = echarts.init(null, null, { height: spec.height ?? 360, renderer: "svg", ssr: true, width });
  chart.setOption(chartOption(spec));
  const svg = chart.renderToSVGString();
  chart.dispose();
  return svg;
}

/**
 * A chart drawn on the server only, for articles and reference pages. This file never imports the
 * interactive chart, so pages that use it send no chart script at all.
 */
export function UiStaticChart({ spec }: { spec: UiChartSpec }) {
  const legend = chartLegend(spec);
  const height = spec.height ?? 360;
  const total = donutTotal(spec);
  const withTable = hasChartTable(spec);
  // Small charts are read from their hidden table. Larger ones get a short description instead.
  const description = [spec.title, spec.caption, legend.length ? `Shows ${legend.map((item) => item.label).join(", ")}.` : null].filter(Boolean).join(". ");
  return (
    <figure className={`${styles.figure} ${styles.static}`}>
      <ChartHeading spec={spec} />
      {legend.length > 1 ? (
        <ul className={styles.legend}>
          {legend.map((item, index) => (
            <li className={styles.legendItem} key={item.label}>
              <span className={styles.swatch} data-series={index % 7} />
              {item.label}
              {item.detail ? <span className={styles.legendDetail}>{item.detail}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      <div aria-hidden={withTable || undefined} aria-label={withTable ? undefined : description} className={styles.plot} role={withTable ? undefined : "img"}>
        <div aria-hidden="true" className={`${styles.staticDrawing} ${styles.wideDrawing}`} dangerouslySetInnerHTML={{ __html: renderChartSvg(spec, proseWidth) }} style={{ aspectRatio: `${proseWidth} / ${height}` }} />
        <div aria-hidden="true" className={`${styles.staticDrawing} ${styles.narrowDrawing}`} dangerouslySetInnerHTML={{ __html: renderChartSvg(spec, phoneWidth) }} style={{ aspectRatio: `${phoneWidth} / ${height}` }} />
        {total ? <p className={styles.donutTotal}><strong>{total}</strong><span>Total</span></p> : null}
      </div>
      <ChartDataTable spec={spec} />
    </figure>
  );
}
