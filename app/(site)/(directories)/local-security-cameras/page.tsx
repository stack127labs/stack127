import { Cctv } from "lucide-react";
import { HardwareDirectoryPage } from "../../../ui/directories/hardware-directory-page";
import { getHardwareDirectorySnapshot } from "@/lib/hardware-directories";

export default async function LocalSecurityCamerasPage() {
  return <HardwareDirectoryPage config={{
    detailFilterLabel: "Protocol or connection",
    icon: <Cctv strokeWidth={2.2} />,
    route: "/local-security-cameras",
    searchPlaceholder: "RLC-823A, AD410, ONVIF, PoE...",
    sidebarLabel: "Local cameras",
    title: "Local security cameras directory",
  }} snapshot={await getHardwareDirectorySnapshot("local-security-cameras")} />;
}
