import { RadioTower } from "lucide-react";
import { HardwareDirectoryPage } from "../../../ui/directories/hardware-directory-page";
import { getHardwareDirectorySnapshot } from "@/lib/hardware-directories";

export default async function ZigbeeCoordinatorsPage() {
  return <HardwareDirectoryPage config={{
    detailFilterLabel: "Connection or radio",
    heading: "Zigbee coordinators for",
    highlightedHeading: "ZHA and Zigbee2MQTT",
    icon: <RadioTower strokeWidth={2.2} />,
    intro: "Compare coordinator models by chipset, connection, and support for ZHA or Zigbee2MQTT. Some changes require pairing your devices again.",
    route: "/zigbee-coordinators",
    searchPlaceholder: "ZBDongle-P, SLZB-06, CC2652...",
    sidebarLabel: "Zigbee coordinators",
    buyingNote: "Check that the firmware supports your exact adapter before switching. Some changes require pairing your devices again.",
    title: "Zigbee coordinators directory",
  }} snapshot={await getHardwareDirectorySnapshot("zigbee-coordinators")} />;
}
