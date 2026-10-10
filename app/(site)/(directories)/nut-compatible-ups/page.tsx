import { BatteryCharging } from "lucide-react";
import { HardwareDirectoryPage } from "../../../ui/directories/hardware-directory-page";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import { getHardwareDirectorySnapshot } from "@/lib/hardware-directories";

export default async function NutCompatibleUpsPage() {
  return <HardwareDirectoryPage article={<Article />} intro={<Intro />} config={{
    detailFilterLabel: "Driver, connection or support",
    icon: <BatteryCharging strokeWidth={2.2} />,
    route: "/nut-compatible-ups",
    searchPlaceholder: "BX1000M, CP1500AVRLCD, Eaton...",
    sidebarLabel: "NUT-compatible UPS",
    title: "NUT-compatible UPS directory",
  }} snapshot={await getHardwareDirectorySnapshot("nut-compatible-ups")} />;
}
