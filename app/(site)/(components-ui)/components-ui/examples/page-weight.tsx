"use client";

import { useEffect, useState } from "react";
import { UiButton } from "@/app/ui/controls";
import { UiKeyValueList } from "@/app/ui/display";
import styles from "../components-ui.module.css";

type Weight = {
  chartScripts: { count: number; size: number; wire: number };
  charts: { count: number; slowest: number };
  html: { size: number; wire: number };
  scripts: { count: number; size: number; wire: number };
};

const googleLimit = 2_000_000;

function measure(): Weight {
  const page = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const scripts = (performance.getEntriesByType("resource") as PerformanceResourceTiming[]).filter((entry) => entry.initiatorType === "script");
  const chartScripts = scripts.filter((entry) => /echarts|zrender/i.test(entry.name));
  const sum = (entries: PerformanceResourceTiming[]) => ({
    count: entries.length,
    size: entries.reduce((total, entry) => total + entry.decodedBodySize, 0),
    wire: entries.reduce((total, entry) => total + entry.transferSize, 0),
  });
  const drawTimes = [...document.querySelectorAll<HTMLElement>("[data-chart-drawn-ms]")].map((chart) => Number(chart.dataset.chartDrawnMs));
  return {
    chartScripts: sum(chartScripts),
    charts: { count: drawTimes.length, slowest: Math.max(0, ...drawTimes) },
    html: { size: page?.decodedBodySize ?? 0, wire: page?.transferSize ?? 0 },
    scripts: sum(scripts),
  };
}

const size = (bytes: number) => bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(2)} MB` : `${(bytes / 1000).toFixed(1)} KB`;

/** Page weight from the browser's own timing records. Development numbers: production scripts are minified. */
export function PageWeight() {
  const [weight, setWeight] = useState<Weight | null>(null);

  useEffect(() => {
    // Wait for the charts to draw and late scripts to land.
    const timer = setTimeout(() => setWeight(measure()), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!weight) return <p className={styles.chartWeight}>Measuring…</p>;

  return (
    <div className={styles.stack}>
      <UiKeyValueList rows={[
        { label: "Page HTML", value: `${size(weight.html.size)} (${(weight.html.size / googleLimit * 100).toFixed(1)}% of the 2 MB limit) · ${size(weight.html.wire)} over the network` },
        { label: "All scripts", value: `${weight.scripts.count} files · ${size(weight.scripts.size)} · ${size(weight.scripts.wire)} over the network` },
        { label: "Chart scripts", value: weight.chartScripts.count ? `${weight.chartScripts.count} files · ${size(weight.chartScripts.size)} · ${size(weight.chartScripts.wire)} over the network` : "Bundled with other scripts in development" },
        { label: "Charts drawn", value: `${weight.charts.count} in the browser · slowest took ${Math.round(weight.charts.slowest)} ms` },
      ]} />
      <p className={styles.chartWeight}>
        These are development server numbers. Production scripts are minified and much smaller; the HTML is close to production.
      </p>
      <div>
        <UiButton onPress={() => setWeight(measure())}>Measure again</UiButton>
      </div>
    </div>
  );
}
