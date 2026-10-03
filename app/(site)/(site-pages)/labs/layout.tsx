import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/labs");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
