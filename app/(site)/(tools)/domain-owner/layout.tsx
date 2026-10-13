import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/domain-owner");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
