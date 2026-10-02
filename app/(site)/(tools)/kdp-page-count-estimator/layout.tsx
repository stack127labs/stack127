import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/kdp-page-count-estimator");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
