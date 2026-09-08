import { BatteryCharging } from "lucide-react";
import { HardwareDirectoryPage } from "../_components/hardware-directory-page";
import type { HardwareDirectorySearchParams } from "../_components/hardware-directory-filters";
import { getHardwareDirectorySnapshot } from "@/lib/hardware-directories";

export default async function NutCompatibleUpsPage({ searchParams }: { searchParams: Promise<HardwareDirectorySearchParams> }) {
  return <HardwareDirectoryPage config={{
    evidenceRows: [
      { evidence: "NUT level 1", proves: "A driver exists from reverse-engineered protocol behavior.", limit: "Every command or status value works." },
      { evidence: "NUT levels 2 to 3", proves: "The driver uses partial or public protocol documentation.", limit: "The manufacturer tested this exact retail suffix." },
      { evidence: "NUT levels 4 to 5", proves: "The vendor supplied protocol information, and at level 5 also supplied hardware.", limit: "Every firmware revision behaves identically." },
    ],
    heading: "UPS models with",
    highlightedHeading: "Network UPS Tools drivers",
    icon: <BatteryCharging strokeWidth={2.2} />,
    intro: "Find the exact HCL record, driver, connection, and support level before buying a UPS for a server or NAS. Family names and regional suffixes can hide different USB implementations.",
    route: "/nut-compatible-ups",
    searchPlaceholder: "BX1000M, CP1500AVRLCD, Eaton...",
    sidebarLabel: "NUT-compatible UPS",
    sourceSentence: "The NUT hardware list records driver evidence, not battery runtime or load capacity. Confirm electrical specifications on the linked manufacturer page.",
    title: "NUT-compatible UPS directory",
  }} params={await searchParams} snapshot={await getHardwareDirectorySnapshot("nut-compatible-ups")} />;
}
