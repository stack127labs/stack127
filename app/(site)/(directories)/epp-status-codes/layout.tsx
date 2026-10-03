import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/epp-status-codes");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
