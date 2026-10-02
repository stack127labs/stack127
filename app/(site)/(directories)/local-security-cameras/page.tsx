import { Cctv } from "lucide-react";
import { HardwareDirectoryPage } from "../../../ui/directories/hardware-directory-page";
import { getHardwareDirectorySnapshot } from "@/lib/hardware-directories";

export default async function LocalSecurityCamerasPage() {
  return <HardwareDirectoryPage config={{
    detailFilterLabel: "Protocol or connection",
    heading: "Local security cameras for",
    highlightedHeading: "Frigate and Home Assistant",
    icon: <Cctv strokeWidth={2.2} />,
    intro: "Compare camera models by RTSP or ONVIF, resolution, and power. Check the listed Frigate status before using a stream setup.",
    route: "/local-security-cameras",
    searchPlaceholder: "RLC-823A, AD410, ONVIF, PoE...",
    sidebarLabel: "Local cameras",
    buyingNote: "Some camera details come from published records and have not been tested on our own camera. Check the Frigate status and exact stream details before setup.",
    title: "Local security cameras directory",
  }} snapshot={await getHardwareDirectorySnapshot("local-security-cameras")} />;
}
