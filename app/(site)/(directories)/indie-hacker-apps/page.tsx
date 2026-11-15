import Link from "next/link";
import { BriefcaseBusiness, CalendarClock, CircleDollarSign, Rows3 } from "lucide-react";
import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { getRequiredPublishedPage } from "@/lib/page-registry";
import { RegistryStructuredData } from "@/lib/registry-layout";
import { getIndieCategoryData, indieCategories, indieCategoryPath } from "@/lib/indie-hacker-apps";
import { AppFactCardContent, appFactCardClassName } from "@/app/ui/directories/app-fact-card";
import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { DirectoryTitleIcon } from "@/app/ui/directories/directory-title-icon";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageMeta } from "@/app/ui/site/page-meta";
import { proseClassName, proseSectionFlowClassName } from "@/app/ui/site/prose";
import { SidebarList } from "@/app/ui/site/sidebar-list";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { RecentChanges } from "./changes";
import { CategoryIcon } from "./icons";
import styles from "./indie.module.css";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";

const ninetyDaysAgo = () => new Date(Date.now() - 90 * 86_400_000).toISOString().slice(0, 10);

export default async function IndieHackerAppsPage() {
  const [directoryPage, registryPage, data] = await Promise.all([
    getRequiredDirectoryPage("indie-hacker-apps"),
    getRequiredPublishedPage("indie-hacker-apps"),
    Promise.all(indieCategories.map((category) => getIndieCategoryData(category.slug))),
  ]);
  const since = ninetyDaysAgo();
  const today = new Date().toISOString().slice(0, 10);
  const categories = indieCategories.map((category, index) => ({
    category,
    apps: data[index].apps.length,
    recent: data[index].changes.filter((change) => change.date >= since && change.date <= today).length,
  }));
  const total = categories.reduce((sum, item) => sum + item.apps, 0);
  const changes = data
    .flatMap((item, index) => item.changes.map((change) => ({ ...change, category: indieCategories[index].slug })))
    .sort((a, b) => b.date.localeCompare(a.date));
  const categoryNames = Object.fromEntries(indieCategories.map((category) => [category.slug, category.name]));

  const sidebar = (
    <div className={sidebarPanelClassName}>
      <div className={sidebarPanelHeadingClassName}><SidebarLabel>{registryPage.label}</SidebarLabel></div>
      <nav aria-label="Categories">
        <SidebarList items={categories.map(({ category, apps }) => ({
          href: indieCategoryPath(category.slug),
          label: category.name,
          icon: <CategoryIcon size={15} slug={category.slug} />,
          count: String(apps),
        }))} />
      </nav>
    </div>
  );

  return (
    <>
      <RegistryStructuredData path="/indie-hacker-apps" />
      <AppShell mainLabel="Indie hacker app categories" menuLabel="Categories" sidebar={sidebar} sidebarLabel="Categories">
        <EntryHero art={null}>
          <PageHeader breadcrumbs={await getBreadcrumbs("indie-hacker-apps")}>
            <h1><DirectoryTitleIcon iconKey={directoryPage.card_icon_key} />{" "}<DirectoryPageTitle title={directoryPage.title} /></h1>
            <PageMeta updatedAt={directoryPage.updated_at} />
            <Intro />
          </PageHeader>
        </EntryHero>
        <PageCanvas as="div" className="directory-results" flow>
          <p className={styles.count}>{indieCategories.length} categories · {total} apps</p>
          <div className="directory-card-grid">
            {categories.map(({ category, apps, recent }) => {
              const first = Object.values(category.sets)[0];
              return (
                <Link className={`directory-card ${appFactCardClassName}`} href={indieCategoryPath(category.slug)} key={category.slug}>
                  <AppFactCardContent
                    categories={[{ name: `${category.jobs.length} jobs` }]}
                    facts={[
                      { label: "Apps", value: String(apps), icon: Rows3 },
                      { label: "Jobs", value: category.jobs.map(([, label]) => label).join(", "), icon: BriefcaseBusiness },
                      { label: "Priced at", value: first.unit ? `${first.levels[first.default]} ${first.unit}` : first.short[first.default], icon: CircleDollarSign },
                      { label: "Changes", value: `${recent} in 90 days`, icon: CalendarClock },
                    ]}
                    image={<span aria-hidden="true" className={styles.letterIcon}><CategoryIcon size={22} slug={category.slug} /></span>}
                    name={category.name}
                    summary={category.summary}
                  />
                </Link>
              );
            })}
          </div>
          <article className={`${proseClassName} ${proseSectionFlowClassName}`}>
            <RecentChanges categoryNames={categoryNames} changes={changes} />
            <Article />
          </article>
        </PageCanvas>
      </AppShell>
    </>
  );
}
