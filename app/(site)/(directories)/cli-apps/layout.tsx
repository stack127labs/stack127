import "../../../ui/directories/directory.css";
import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/cli-apps", { structuredData: "page" });
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
