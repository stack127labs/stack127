import type { ReactNode } from "react";
import { AppShell } from "@/app/ui/site/app-shell";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageMeta } from "@/app/ui/site/page-meta";
import { DirectoryPageTitle } from "./directory-page-content";
import type { Stack127DirectoryPage } from "@/lib/directory-pages";
import type { AppCategoryLink, AppDirectory } from "@/lib/app-category-model";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { AppCategoryLinks } from "./app-category-links";
import { categoryListHtml, type CategoryAppRow } from "@/lib/app-category-html";
import styles from "./app-category.module.css";

export async function AppCategoryPage({ directory, category, directoryPage, intro, apps, categories }: {
  directory: AppDirectory; category: string; directoryPage: Stack127DirectoryPage;
  intro: ReactNode; apps: readonly CategoryAppRow[]; categories: readonly AppCategoryLink[];
}) {
  return <AppShell sidebarPosition="none" mainLabel={directoryPage.card_name}>
    <PageCanvas>
      <PageHeader breadcrumbs={await getBreadcrumbs(directoryPage.slug)}>
        <h1><DirectoryPageTitle title={directoryPage.title} /></h1>
        <PageMeta updatedAt={directoryPage.updated_at} />
        {intro}
      </PageHeader>
      <section aria-label="Apps" className={styles.listing}>
        <p className={styles.count}>{apps.length.toLocaleString("en-US")} apps</p>
        {/* Compact HTML avoids a separate React element tree for every row. React
            still includes this HTML string in its navigation payload, so the list
            travels twice in the initial document. The serializer escapes dataset
            text and validates outbound protocols. */}
        <ul dangerouslySetInnerHTML={{ __html: categoryListHtml(apps) }} />
      </section>
      <AppCategoryLinks categories={categories} current={category} />
      <p><a href={`/${directory}`}>Back to {directory === "cli-apps" ? "CLI apps" : "self-host apps"}</a></p>
    </PageCanvas>
  </AppShell>;
}
