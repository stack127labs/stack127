import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/kindle-unlimited-kenp-earnings-calculator");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
