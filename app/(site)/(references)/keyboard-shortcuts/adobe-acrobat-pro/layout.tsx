import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/keyboard-shortcuts/adobe-acrobat-pro");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
