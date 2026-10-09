import { UiBarChart, UiDonutChart, UiFlowChart, UiLineChart } from "@/app/ui/visuals";
import { Example } from "../gallery";
import styles from "../components-ui.module.css";

export function ChartsExamples() {
  return (
    <>
      <Example components={["UiBarChart"]} note="Nonnegative categories side by side." source="app/ui/visuals.tsx" title="Bar chart">
        <UiBarChart
          ariaLabel="Requests handled by service"
          caption="Successful requests during the same 15-minute sample."
          data={[
            { id: "api", label: "API", value: 1840 },
            { id: "worker", label: "Worker", value: 1210 },
            { id: "scheduler", label: "Scheduler", value: 680 },
            { id: "webhook", label: "Webhook", value: 420 },
          ]}
          formatValue={(value) => value.toLocaleString("en")}
        />
      </Example>

      <Example components={["UiLineChart"]} note="One series over time. Long series scroll on small screens." source="app/ui/visuals.tsx" title="Line chart">
        <UiLineChart
          ariaLabel="Storage use over six months"
          caption="Measured pool use, not provisioned capacity."
          formatValue={(value) => `${value} TB`}
          points={[
            { id: "apr", label: "April 2026", value: 8.2, xLabel: "Apr" },
            { id: "may", label: "May 2026", value: 9.1, xLabel: "May" },
            { id: "jun", label: "June 2026", value: 9.8, xLabel: "Jun" },
            { id: "jul", label: "July 2026", value: 11.4, xLabel: "Jul" },
            { id: "aug", label: "August 2026", value: 12.2, xLabel: "Aug" },
            { id: "sep", label: "September 2026", value: 13.6, xLabel: "Sep" },
          ]}
          valueLabel="Used storage"
        />
      </Example>

      <Example components={["UiDonutChart"]} note="Parts of one total. An allocation bar is often easier to compare." source="app/ui/visuals.tsx" title="Donut chart">
        <div className={styles.narrow}>
          <UiDonutChart
            ariaLabel="Requests by service"
            caption="Each segment is part of the same total."
            data={[
              { id: "api", label: "API", value: 50 },
              { id: "worker", label: "Worker", value: 30 },
              { id: "scheduler", label: "Scheduler", value: 20 },
            ]}
          />
        </div>
      </Example>

      <Example components={["UiFlowChart"]} note="Ordered stages with complete, current, and pending states." source="app/ui/visuals.tsx" title="Flow chart">
        <UiFlowChart
          ariaLabel="PDF processing flow"
          stages={[
            { detail: "File type and size accepted", id: "receive", label: "Receive", state: "complete" },
            { detail: "Pages, boxes, fonts, and images", id: "inspect", label: "Inspect", state: "complete" },
            { detail: "Compare against the selected KDP setup", id: "compare", label: "Compare", state: "current" },
            { detail: "Readable findings and report", id: "report", label: "Report", state: "pending" },
          ]}
        />
      </Example>
    </>
  );
}
