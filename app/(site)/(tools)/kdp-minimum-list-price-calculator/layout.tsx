import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/kdp-minimum-list-price-calculator", false);
export const generateMetadata = registry.generateMetadata;
export const revalidate = 604800;
export default registry.Layout;
