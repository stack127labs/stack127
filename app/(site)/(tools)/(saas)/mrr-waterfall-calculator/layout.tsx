import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/mrr-waterfall-calculator", false);
export const generateMetadata = registry.generateMetadata;
export const revalidate = 604800;
export default registry.Layout;
