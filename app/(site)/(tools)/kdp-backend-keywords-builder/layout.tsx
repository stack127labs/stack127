import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/kdp-backend-keywords-builder");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
