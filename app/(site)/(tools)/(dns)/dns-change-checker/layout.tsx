import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/dns-change-checker", true);
export const generateMetadata = registry.generateMetadata;
export const revalidate = 604800;
export default registry.Layout;
