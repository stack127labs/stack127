import { Network } from "lucide-react";
import { HardwareDirectoryPage } from "../../../ui/directories/hardware-directory-page";
import { getHardwareDirectorySnapshot } from "@/lib/hardware-directories";

export default async function MatterDevicesPage() {
  return <HardwareDirectoryPage config={{
    detailFilterLabel: "Transport or version",
    heading: "Matter devices with",
    highlightedHeading: "certification evidence",
    icon: <Network strokeWidth={2.2} />,
    intro: "Search Matter-compatible devices by manufacturer, category, transport, and certificate ID. Certification confirms the standard record, but Home Assistant may expose fewer optional features than another controller.",
    route: "/matter-devices",
    searchPlaceholder: "Eve, Nanoleaf, Thread, plug...",
    sidebarLabel: "Matter devices",
    buyingNote: "Matter certification confirms the product is certified. Home Assistant may still expose fewer features than another controller.",
    title: "Matter devices directory",
  }} snapshot={await getHardwareDirectorySnapshot("matter-devices")} />;
}
