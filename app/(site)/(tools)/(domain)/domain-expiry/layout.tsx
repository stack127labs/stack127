import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/domain-expiry", true);
export const generateMetadata = registry.generateMetadata;
export const revalidate = 604800;
export default registry.Layout;
