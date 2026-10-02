import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/kdp-minimum-list-price-calculator");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
