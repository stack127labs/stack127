import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/components-ui/sidebar-modes/[position]");
export const generateMetadata = registry.generateMetadata;
export function generateStaticParams() { return []; }
export const revalidate = false;
export default registry.Layout;
