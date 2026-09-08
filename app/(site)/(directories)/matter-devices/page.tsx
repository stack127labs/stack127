import { Network } from "lucide-react";
import { HardwareDirectoryPage } from "../_components/hardware-directory-page";
import type { HardwareDirectorySearchParams } from "../_components/hardware-directory-filters";
import { getHardwareDirectorySnapshot } from "@/lib/hardware-directories";

export default async function MatterDevicesPage({ searchParams }: { searchParams: Promise<HardwareDirectorySearchParams> }) {
  return <HardwareDirectoryPage config={{
    evidenceRows: [
      { evidence: "CSA certification", proves: "The cited product has a Matter certification record and certificate ID.", limit: "Every optional cluster or ecosystem feature is implemented." },
      { evidence: "Transport record", proves: "The source identifies Thread or Wi-Fi and any Bluetooth commissioning support.", limit: "A border router or local network is configured correctly." },
      { evidence: "Product identity", proves: "An image and EAN refer to the cited product when the source publishes them.", limit: "A similarly named regional package uses the same identifier." },
    ],
    heading: "Matter devices with",
    highlightedHeading: "certification evidence",
    icon: <Network strokeWidth={2.2} />,
    intro: "Search Matter-compatible devices by manufacturer, category, transport, and certificate ID. Certification confirms the standard record, but Home Assistant may expose fewer optional features than another controller.",
    route: "/matter-devices",
    searchPlaceholder: "Eve, Nanoleaf, Thread, plug...",
    sidebarLabel: "Matter devices",
    sourceSentence: "The directory labels certification and transport separately. It does not turn a CSA certificate into a claim about every Home Assistant entity.",
    title: "Matter devices directory",
  }} params={await searchParams} snapshot={await getHardwareDirectorySnapshot("matter-devices")} />;
}
