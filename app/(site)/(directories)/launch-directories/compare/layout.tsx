import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/launch-directories/compare");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
