import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/self-hosting-for-beginners/backups-before-serious-apps");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
