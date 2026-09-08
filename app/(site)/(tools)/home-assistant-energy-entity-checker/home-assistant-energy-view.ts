import type { CounterResult, EnergyEntityRole, ValidEnergyEntityResult } from "../../../../lib/home-assistant-energy/eligibility.ts";

export const ENERGY_ROLE_LABELS: Record<EnergyEntityRole, string> = {
  battery_charge: "Battery charge",
  battery_discharge: "Battery discharge",
  gas: "Gas",
  grid_export: "Grid export",
  grid_import: "Grid import",
  individual_device: "Individual device",
  power: "Power",
  solar: "Solar",
  water: "Water",
};

export function energyAnswer(result: ValidEnergyEntityResult) {
  return `Attributes ${result.energy.status === "fails_attributes" ? "do not match" : "match"} ${ENERGY_ROLE_LABELS[result.input.role]}.`;
}

export function statisticsAnswer(result: ValidEnergyEntityResult) {
  return `Statistics attributes ${result.statistics.status === "fails_attributes" ? "do not match" : "match"}.`;
}

export function counterTone(counter: CounterResult): "neutral" | "success" | "warning" | "danger" {
  if (counter.status === "pass") return "success";
  if (counter.status === "fail") return "danger";
  if (counter.status === "unknown") return "warning";
  return "neutral";
}

export function visibleReceived(value: string) {
  const characters = Array.from(value);
  return characters.length <= 120 ? value : `${characters.slice(0, 119).join("")}…`;
}
