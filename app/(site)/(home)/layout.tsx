import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/", false);
export const generateMetadata = registry.generateMetadata;
export const revalidate = 86400;
export default registry.Layout;
