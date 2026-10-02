import { BatteryCharging } from "lucide-react";
import { HardwareDirectoryPage } from "../../../ui/directories/hardware-directory-page";
import { getHardwareDirectorySnapshot } from "@/lib/hardware-directories";

export default async function NutCompatibleUpsPage() {
  return <HardwareDirectoryPage config={{
    detailFilterLabel: "Driver, connection or support",
    heading: "UPS models with",
    highlightedHeading: "Network UPS Tools drivers",
    icon: <BatteryCharging strokeWidth={2.2} />,
    intro: "Check whether Network UPS Tools supports your UPS model, which driver it uses, and how it connects. Product family entries may not cover every model.",
    route: "/nut-compatible-ups",
    searchPlaceholder: "BX1000M, CP1500AVRLCD, Eaton...",
    sidebarLabel: "NUT-compatible UPS",
    buyingNote: "Check the driver and connection for your exact model. A product family listing may not cover every model or regional version.",
    title: "NUT-compatible UPS directory",
  }} snapshot={await getHardwareDirectorySnapshot("nut-compatible-ups")} />;
}
