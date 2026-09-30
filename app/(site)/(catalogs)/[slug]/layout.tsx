import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/[slug]", false);
export const generateMetadata = registry.generateMetadata;
export function generateStaticParams() { return []; }
export const revalidate = 604800;
export default registry.Layout;
