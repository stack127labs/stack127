import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/drive-reliability");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
