import { Waves } from "lucide-react";
import { HardwareDirectoryPage } from "../../../ui/directories/hardware-directory-page";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import { getHardwareDirectorySnapshot } from "@/lib/hardware-directories";

export default async function ZWaveDevicesPage() {
  return <HardwareDirectoryPage article={<Article />} intro={<Intro />} config={{
    detailFilterLabel: "Region or software support",
    icon: <Waves strokeWidth={2.2} />,
    route: "/z-wave-devices",
    searchPlaceholder: "ZW100, ZEN77, FGMS-001...",
    sidebarLabel: "Z-Wave devices",
    title: "Z-Wave devices directory",
  }} snapshot={await getHardwareDirectorySnapshot("z-wave-devices")} />;
}
