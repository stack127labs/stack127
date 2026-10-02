import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/multi-tld-availability");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
