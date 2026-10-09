import { RadioTower } from "lucide-react";
import { HardwareDirectoryPage } from "../../../ui/directories/hardware-directory-page";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import { getHardwareDirectorySnapshot } from "@/lib/hardware-directories";

export default async function ZigbeeCoordinatorsPage() {
  return <HardwareDirectoryPage article={<Article />} intro={<Intro />} config={{
    detailFilterLabel: "Connection or radio",
    icon: <RadioTower strokeWidth={2.2} />,
    route: "/zigbee-coordinators",
    searchPlaceholder: "ZBDongle-P, SLZB-06, CC2652...",
    sidebarLabel: "Zigbee coordinators",
    title: "Zigbee coordinators directory",
  }} snapshot={await getHardwareDirectorySnapshot("zigbee-coordinators")} />;
}
