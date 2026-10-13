import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/soa-checker");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
