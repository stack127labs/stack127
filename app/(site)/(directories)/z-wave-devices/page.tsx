import { Waves } from "lucide-react";
import { HardwareDirectoryPage } from "../_components/hardware-directory-page";
import type { HardwareDirectorySearchParams } from "../_components/hardware-directory-filters";
import { getHardwareDirectorySnapshot } from "@/lib/hardware-directories";

export default async function ZWaveDevicesPage({ searchParams }: { searchParams: Promise<HardwareDirectorySearchParams> }) {
  return <HardwareDirectoryPage config={{
    evidenceRows: [
      { evidence: "Z-Wave JS config", proves: "The exact manufacturer, product type, and product ID have a configuration record.", limit: "A retail listing uses the same regional radio or firmware." },
      { evidence: "Alliance certification", proves: "A specific product variant passed the Z-Wave certification process.", limit: "Home Assistant exposes every optional function." },
      { evidence: "Product image", proves: "When published, the enclosure matches the cited certification or manufacturer page.", limit: "Internal hardware is unchanged across visually identical revisions." },
    ],
    heading: "Z-Wave devices with",
    highlightedHeading: "exact product IDs",
    icon: <Waves strokeWidth={2.2} />,
    intro: "Search exact Z-Wave models and inspect the identifiers Z-Wave JS uses to select a configuration. Match the frequency region and firmware before buying because a retail name can cover several variants.",
    route: "/z-wave-devices",
    searchPlaceholder: "ZW100, ZEN77, FGMS-001...",
    sidebarLabel: "Z-Wave devices",
    sourceSentence: "A Z-Wave JS configuration is strong software evidence. The Alliance record adds certification and region details, but neither replaces checking the identifiers reported by the device.",
    title: "Z-Wave devices directory",
  }} params={await searchParams} snapshot={await getHardwareDirectorySnapshot("z-wave-devices")} />;
}
