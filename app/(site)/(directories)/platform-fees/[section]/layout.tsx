import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/platform-fees/[section]", true);
export const generateMetadata = registry.generateMetadata;
export const dynamic = "force-dynamic";
export const revalidate = 604800;
export default registry.Layout;
