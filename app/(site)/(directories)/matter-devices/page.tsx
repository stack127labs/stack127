import { Network } from "lucide-react";
import { HardwareDirectoryPage } from "../../../ui/directories/hardware-directory-page";
import type { HardwareDirectorySearchParams } from "../../../ui/directories/hardware-directory-filters";
import { getHardwareDirectorySnapshot } from "@/lib/hardware-directories";

export default async function MatterDevicesPage({ searchParams }: { searchParams: Promise<HardwareDirectorySearchParams> }) {
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
  }} params={await searchParams} snapshot={await getHardwareDirectorySnapshot("matter-devices")} />;
}
