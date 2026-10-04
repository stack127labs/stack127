import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/break-even-mrr-calculator");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
