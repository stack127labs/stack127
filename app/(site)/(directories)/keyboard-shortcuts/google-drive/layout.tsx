import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/keyboard-shortcuts/google-drive");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
