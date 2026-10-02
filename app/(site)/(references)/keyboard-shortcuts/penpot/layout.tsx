import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/keyboard-shortcuts/penpot");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
