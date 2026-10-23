"use client";

import { useId, useState } from "react";
import { UiTabRow, uiTabPanelProps } from "@/app/ui/tabs";

const tabs = [
  { id: "revenue", title: "Revenue" },
  { id: "cpm", title: "CPM to RPM" },
  { id: "rpm", title: "Find RPM" },
];

export function TabRowDemo() {
  const panelId = useId();
  const [tab, setTab] = useState("revenue");
  return (
    <div>
      <UiTabRow label="What to calculate" onChange={setTab} panelId={panelId} tabs={tabs} value={tab} />
      <p {...uiTabPanelProps(panelId, tab)}>The {tabs.find((item) => item.id === tab)?.title} inputs go here.</p>
    </div>
  );
}
