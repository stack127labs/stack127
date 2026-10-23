import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/ad-network-requirements-checker");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
