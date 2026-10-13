import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/punycode-converter");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
