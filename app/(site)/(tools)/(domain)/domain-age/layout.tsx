import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/domain-age", true);
export const generateMetadata = registry.generateMetadata;
export const revalidate = 604800;
export default registry.Layout;
