import "./software-licenses.css";
import { registryLayout } from "@/lib/registry-layout";

const registry = registryLayout("/software-licenses-for-self-hosting", false);
export const generateMetadata = registry.generateMetadata;
export const revalidate = 604800;
export default registry.Layout;
