import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/customer-lifetime-value-calculator");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
