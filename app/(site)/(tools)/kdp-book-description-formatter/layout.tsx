import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/kdp-book-description-formatter");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
