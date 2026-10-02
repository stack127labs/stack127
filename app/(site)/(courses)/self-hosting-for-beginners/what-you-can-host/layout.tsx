import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/self-hosting-for-beginners/what-you-can-host");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
