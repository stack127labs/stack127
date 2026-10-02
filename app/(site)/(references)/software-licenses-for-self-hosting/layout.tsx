import "./software-licenses.css";
import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/software-licenses-for-self-hosting");
export const generateMetadata = registry.generateMetadata;
export const revalidate = false;
export default registry.Layout;
