import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/kindle-unlimited-kenp-earnings-calculator", false);
export const generateMetadata = registry.generateMetadata;
export const revalidate = 604800;
export default registry.Layout;
