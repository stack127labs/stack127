import "../../../ui/directories/directory.css";
import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/z-wave-devices", true);
export const generateMetadata = registry.generateMetadata;
export const revalidate = 604800;
export default registry.Layout;
