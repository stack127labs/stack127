import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/ip-asn-lookup");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
