import { Cctv } from "lucide-react";
import { HardwareDirectoryPage } from "../../../ui/directories/hardware-directory-page";
import type { HardwareDirectorySearchParams } from "../../../ui/directories/hardware-directory-filters";
import { getHardwareDirectorySnapshot } from "@/lib/hardware-directories";

export default async function LocalSecurityCamerasPage({ searchParams }: { searchParams: Promise<HardwareDirectorySearchParams> }) {
  return <HardwareDirectoryPage config={{
    evidenceRows: [
      { evidence: "Manufacturer specification", proves: "The cited model documents its resolution, power, and advertised local protocols.", limit: "A firmware update keeps every endpoint enabled." },
      { evidence: "ONVIF or RTSP record", proves: "The source lists a standards-based or direct local video path.", limit: "Every optional PTZ or audio function works." },
      { evidence: "Verified Frigate config", proves: "A named stream layout has a recorded Frigate test.", limit: "The same settings fit a different hardware revision." },
    ],
    heading: "Local security cameras for",
    highlightedHeading: "Frigate and Home Assistant",
    icon: <Cctv strokeWidth={2.2} />,
    intro: "Compare exact camera models by RTSP, ONVIF, substream, PoE, audio, and recorded Frigate configuration. Firmware can change local access, so keep the source and verification date with the model.",
    route: "/local-security-cameras",
    searchPlaceholder: "RLC-823A, AD410, ONVIF, PoE...",
    sidebarLabel: "Local cameras",
    sourceSentence: "Local protocol support is the buying boundary here. Cloud features and vendor app claims stay out unless they affect local setup.",
    title: "Local security cameras directory",
  }} params={await searchParams} snapshot={await getHardwareDirectorySnapshot("local-security-cameras")} />;
}
