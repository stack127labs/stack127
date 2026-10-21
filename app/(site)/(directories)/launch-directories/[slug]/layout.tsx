import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/launch-directories/[slug]");
export const generateMetadata = registry.generateMetadata;
export function generateStaticParams() { return []; }
export const revalidate = false;
export default registry.Layout;
