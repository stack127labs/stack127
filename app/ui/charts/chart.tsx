import { chartLegend, chartOption, donutTotal, type UiChartSpec } from "./chart-option";
import { UiChartClient } from "./chart-client";
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
 * Any chart from data. The server draws it as SVG, so it shows before scripts run and search
 * engines see it. Interactive charts then add hover, line toggles, and range controls in the browser.
 * Static charts send no chart script at all.
 */
export function UiChart({ interactive = true, spec }: { interactive?: boolean; spec: UiChartSpec }) {
  if (interactive) return <UiChartClient spec={spec} svg={renderChartSvg(spec)} />;

  const legend = chartLegend(spec);
  const height = spec.height ?? 360;
  const total = donutTotal(spec);
  return (
    <figure className={`${styles.figure} ${styles.static}`}>
      <figcaption className={styles.caption}>{spec.title}</figcaption>
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
      <div className={styles.plot}>
        <div className={`${styles.staticDrawing} ${styles.wideDrawing}`} dangerouslySetInnerHTML={{ __html: renderChartSvg(spec, proseWidth) }} style={{ aspectRatio: `${proseWidth} / ${height}` }} />
        <div className={`${styles.staticDrawing} ${styles.narrowDrawing}`} dangerouslySetInnerHTML={{ __html: renderChartSvg(spec, phoneWidth) }} style={{ aspectRatio: `${phoneWidth} / ${height}` }} />
        {total ? <p className={styles.donutTotal}><strong>{total}</strong><span>Total</span></p> : null}
      </div>
    </figure>
  );
}
