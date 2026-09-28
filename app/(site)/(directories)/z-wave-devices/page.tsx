import { Waves } from "lucide-react";
import { HardwareDirectoryPage } from "../../../ui/directories/hardware-directory-page";
import type { HardwareDirectorySearchParams } from "../../../ui/directories/hardware-directory-filters";
import { getHardwareDirectorySnapshot } from "@/lib/hardware-directories";

export default async function ZWaveDevicesPage({ searchParams }: { searchParams: Promise<HardwareDirectorySearchParams> }) {
  return <HardwareDirectoryPage config={{
    detailFilterLabel: "Region or software support",
    heading: "Z-Wave devices with",
    highlightedHeading: "exact product IDs",
    icon: <Waves strokeWidth={2.2} />,
    intro: "Search exact Z-Wave models and inspect the identifiers Z-Wave JS uses to select a configuration. Match the frequency region and firmware before buying because a retail name can cover several variants.",
    route: "/z-wave-devices",
    searchPlaceholder: "ZW100, ZEN77, FGMS-001...",
    sidebarLabel: "Z-Wave devices",
    buyingNote: "Check the product ID, radio region, and firmware against your device before buying or pairing it.",
    title: "Z-Wave devices directory",
  }} params={await searchParams} snapshot={await getHardwareDirectorySnapshot("z-wave-devices")} />;
}
