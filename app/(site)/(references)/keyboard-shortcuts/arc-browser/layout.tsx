import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/keyboard-shortcuts/arc-browser", false);
export const generateMetadata = registry.generateMetadata;
export const revalidate = 604800;
export default registry.Layout;
