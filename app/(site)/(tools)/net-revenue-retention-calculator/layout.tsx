import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/net-revenue-retention-calculator");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
