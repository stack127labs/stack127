import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/keyboard-shortcuts/intercom");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
