import "../../../ui/directories/directory.css";
import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/z-wave-devices");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
