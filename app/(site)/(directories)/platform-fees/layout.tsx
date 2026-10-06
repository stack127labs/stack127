import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/platform-fees", { structuredData: "page" });
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
