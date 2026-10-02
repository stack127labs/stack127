import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/self-hosted-app-resource-planner");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
