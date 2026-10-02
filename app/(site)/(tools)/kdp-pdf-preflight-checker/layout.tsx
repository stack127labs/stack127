import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/kdp-pdf-preflight-checker");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
