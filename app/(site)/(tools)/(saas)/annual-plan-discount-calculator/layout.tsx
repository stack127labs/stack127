import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/annual-plan-discount-calculator");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
