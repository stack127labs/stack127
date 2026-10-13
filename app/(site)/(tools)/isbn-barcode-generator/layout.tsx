import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/isbn-barcode-generator");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
