import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/unraid-calculator");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
