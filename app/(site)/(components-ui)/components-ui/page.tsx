import Link from "next/link";
import { notFound } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { gallerySections } from "./sections";
import styles from "./components-ui.module.css";

export default function ComponentGalleryPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const total = gallerySections.reduce((count, section) => count + section.components.length, 0);

  return (
    <PageCanvas>
      <PageHeader bordered>
        <h1><PageTitleIcon><LayoutGrid strokeWidth={2.2} /></PageTitleIcon> Components UI</h1>
        <p>The stack127 component library: {total} shared components, grouped by what they do. Any page can use any of them. A directory can show a tool result, and a tool can list record cards.</p>
      </PageHeader>
      <ul className={styles.sectionGrid}>
        {gallerySections.map((section) => (
          <li key={section.slug}>
            <Link className={styles.sectionLink} href={`/components-ui/${section.slug}`}>
              <span className={styles.sectionTitle}><section.icon aria-hidden="true" size={18} strokeWidth={2.2} />{section.label}</span>
              <span>{section.description}</span>
              <span className={styles.sectionComponents}>{section.components.join(", ")}</span>
            </Link>
          </li>
        ))}
      </ul>
    </PageCanvas>
  );
}
