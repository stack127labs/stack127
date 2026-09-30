import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/arpu-arpa-calculator", false);
export const generateMetadata = registry.generateMetadata;
export const revalidate = 604800;
export default registry.Layout;
