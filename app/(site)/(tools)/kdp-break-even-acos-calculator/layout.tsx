import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/kdp-break-even-acos-calculator");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
