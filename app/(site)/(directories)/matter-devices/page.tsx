import { Network } from "lucide-react";
import { HardwareDirectoryPage } from "../../../ui/directories/hardware-directory-page";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";
import { getHardwareDirectorySnapshot } from "@/lib/hardware-directories";

export default async function MatterDevicesPage() {
  return <HardwareDirectoryPage article={<Article />} intro={<Intro />} config={{
    detailFilterLabel: "Transport or version",
    icon: <Network strokeWidth={2.2} />,
    route: "/matter-devices",
    searchPlaceholder: "Eve, Nanoleaf, Thread, plug...",
    sidebarLabel: "Matter devices",
    title: "Matter devices directory",
  }} snapshot={await getHardwareDirectorySnapshot("matter-devices")} />;
}
