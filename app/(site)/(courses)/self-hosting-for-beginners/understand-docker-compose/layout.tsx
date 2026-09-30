import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/self-hosting-for-beginners/understand-docker-compose", false);
export const generateMetadata = registry.generateMetadata;
export const revalidate = 604800;
export default registry.Layout;
