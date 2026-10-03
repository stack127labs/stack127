import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/keyboard-shortcuts/fl-studio");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
