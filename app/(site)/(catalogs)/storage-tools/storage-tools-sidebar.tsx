import { ToolFamilySidebar } from "@/app/ui/catalogs/tool-family-sidebar";
import styles from "./storage-tools.module.css";

export function StorageToolsSidebar() {
  return <ToolFamilySidebar catalogSlug="storage-tools" label="Storage tools" className={styles.sidebarPanel} />;
}
