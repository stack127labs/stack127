"use client";

import { useMemo, useState } from "react";
import { UiLiveChart } from "@/app/ui/charts/chart-client";
import type { UiChartSpec } from "@/app/ui/charts/chart-option";
import { UiSlider } from "@/app/ui/controls";
import styles from "../components-ui.module.css";

const years = Array.from({ length: 8 }, (_, index) => String(2026 + index));
const usable = 24e12;

/** A tool result computed in the browser: the chart redraws as the slider moves. */
export function LiveChartExample() {
  const [growth, setGrowth] = useState(30);
  const spec = useMemo<UiChartSpec>(() => ({
    caption: `Starting at 6 TB and growing ${growth}% a year.`,
    format: "bytes",
    height: 300,
    kind: "line",
    series: [
      { id: "data", label: "Stored data", points: years.map((year, index) => [year, Math.round(6e12 * (1 + growth / 100) ** index)] as const) },
      { id: "usable", label: "Usable space", points: years.map((year) => [year, usable] as const) },
    ],
    title: "Stored data against usable space",
  }), [growth]);

  return (
    <div className={styles.stack}>
      <div className={styles.narrow}>
        <UiSlider formatOptions={{ maximumFractionDigits: 0, style: "unit", unit: "percent" }} label="Yearly growth" max={80} min={0} onChange={setGrowth} step={5} value={growth} />
      </div>
      <UiLiveChart spec={spec} />
    </div>
  );
}
