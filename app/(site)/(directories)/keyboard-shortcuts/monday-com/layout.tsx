import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/keyboard-shortcuts/monday-com");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
