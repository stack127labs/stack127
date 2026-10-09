"use client";

import { useState } from "react";
import { UiLevelSlider, UiNumberField, UiQuantityField, UiQuantityInput, UiRangeSlider, UiSlider, type UiOption } from "@/app/ui/controls";
import { Example } from "../gallery";
import styles from "../components-ui.module.css";

const unitOptions: UiOption[] = [
  { id: "GB", label: "GB" },
  { id: "TB", label: "TB" },
  { id: "TiB", label: "TiB" },
];

export function NumbersAndSlidersExamples() {
  const [driveCount, setDriveCount] = useState(4);
  const [pageCount, setPageCount] = useState(180);
  const [capacity, setCapacity] = useState(8);
  const [capacityUnit, setCapacityUnit] = useState("TB");
  const [exactCapacity, setExactCapacity] = useState("");
  const [exactUnit, setExactUnit] = useState("TB");
  const [reserve, setReserve] = useState(20);
  const [range, setRange] = useState([4, 12]);
  const [backupConfidence, setBackupConfidence] = useState("tested");

  return (
    <>
      <Example components={["UiNumberField"]} note="Steppers change the value. A suffix shows the unit inside the box. Use a text field instead when a strict parser must explain bad input first." source="app/ui/controls.tsx" title="Number field">
        <div className={styles.twoColumns}>
          <UiNumberField label="Drive count" max={24} min={1} onChange={setDriveCount} value={driveCount} />
          <UiNumberField label="Page count" min={24} onChange={setPageCount} suffix="pages" value={pageCount} />
        </div>
      </Example>

      <Example components={["UiQuantityField", "UiQuantityInput"]} note="Both keep a value and its unit together. The input version keeps the raw text, so the page can check it." source="app/ui/controls.tsx" title="Amount with a unit">
        <div className={styles.twoColumns}>
          <UiQuantityField label="Capacity" min={0} onChange={setCapacity} onUnitChange={setCapacityUnit} unit={capacityUnit} units={unitOptions} value={capacity} />
          <UiQuantityInput label="Exact disk size" onChange={setExactCapacity} onUnitChange={setExactUnit} placeholder="18.25" unit={exactUnit} units={unitOptions} value={exactCapacity} />
        </div>
      </Example>

      <Example components={["UiSlider", "UiRangeSlider"]} source="app/ui/controls.tsx" title="Slider and range slider">
        <UiSlider formatOptions={{ style: "unit", unit: "percent" }} label="Free-space reserve" max={40} onChange={setReserve} value={reserve} />
        <UiRangeSlider formatOptions={{ style: "unit", unit: "terabyte" }} label="Drive-size range" max={24} min={1} onChange={setRange} value={range} />
      </Example>

      <Example components={["UiLevelSlider"]} note="Each step has a name and a description, so people pick a level they understand." source="app/ui/controls.tsx" title="Level slider">
        <div className={styles.narrow}>
          <UiLevelSlider
            label="Backup confidence"
            levels={[
              { description: "A backup job has been configured but not restored.", id: "configured", label: "Configured" },
              { description: "A test restore completed with representative data.", id: "tested", label: "Tested" },
              { description: "Restore checks run on a schedule and alert on failure.", id: "monitored", label: "Monitored" },
              { description: "Restore timing and ownership are documented for production use.", id: "production", label: "Production" },
            ]}
            onChange={setBackupConfidence}
            value={backupConfidence}
          />
        </div>
      </Example>
    </>
  );
}
