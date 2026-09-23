import { RadioTower } from "lucide-react";
import { HardwareDirectoryPage } from "../../../ui/directories/hardware-directory-page";
import type { HardwareDirectorySearchParams } from "../../../ui/directories/hardware-directory-filters";
import { getHardwareDirectorySnapshot } from "@/lib/hardware-directories";

export default async function ZigbeeCoordinatorsPage({ searchParams }: { searchParams: Promise<HardwareDirectorySearchParams> }) {
  return <HardwareDirectoryPage config={{
    evidenceRows: [
      { evidence: "Zigbee2MQTT", proves: "The adapter family appears in the supported-adapter guidance or a linked device record.", limit: "Every firmware build or network transport is equally stable." },
      { evidence: "ZHA", proves: "Home Assistant or a community compatibility record identifies the hardware as usable with ZHA.", limit: "Home Assistant maintains firmware for third-party adapters." },
      { evidence: "Product record", proves: "The retail model, physical connection, and product image refer to the pictured hardware.", limit: "A later board revision keeps the same radio or USB bridge." },
    ],
    heading: "Zigbee coordinators for",
    highlightedHeading: "ZHA and Zigbee2MQTT",
    icon: <RadioTower strokeWidth={2.2} />,
    intro: "Compare exact coordinator models, chipsets, connections, and recorded integration support. Check the firmware target before changing adapters because some migrations require devices to be paired again.",
    route: "/zigbee-coordinators",
    searchPlaceholder: "ZBDongle-P, SLZB-06, CC2652...",
    sidebarLabel: "Zigbee coordinators",
    sourceSentence: "The directory keeps the retail model separate from its radio family. That distinction matters when two adapters look alike but require different firmware.",
    title: "Zigbee coordinators directory",
  }} params={await searchParams} snapshot={await getHardwareDirectorySnapshot("zigbee-coordinators")} />;
}
