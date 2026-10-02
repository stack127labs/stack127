import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/backup-321-calculator");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
