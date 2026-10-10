import { notFound } from "next/navigation";
import { AppShell } from "@/app/ui/site/app-shell";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageMeta } from "@/app/ui/site/page-meta";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { proseClassName, proseFlowClassName } from "@/app/ui/site/prose";
import { ToolCatalog } from "@/app/ui/catalogs/tool-catalog";
import { ToolCatalogSidebar } from "@/app/ui/catalogs/tool-catalog-sidebar";
import { cardArt } from "@/lib/card-art";
import { cardIcon } from "@/lib/card-icons";
import { getPublishedToolCatalog } from "@/lib/tool-catalogs";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { catalogContent } from "./content";

export default async function ToolCatalogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await getPublishedToolCatalog(slug);
  if (!catalog) notFound();
  const content = catalogContent[slug];
  if (!content) throw new Error(`Published catalog has no content: ${slug}`);
  const { Intro, Article } = content;
  const Icon = cardIcon(catalog.card_icon_key);

  return (
    <AppShell
      mainLabel={catalog.card_name}
      menuLabel="Tool catalogs"
      sidebar={<ToolCatalogSidebar active={slug} />}
      sidebarLabel="Tool catalogs sidebar"
    >
      <EntryHero art={cardArt(catalog.card_art_key)}>
        <PageHeader breadcrumbs={await getBreadcrumbs(slug)}>
          <h1>
            <PageTitleIcon><Icon strokeWidth={2.2} /></PageTitleIcon>{" "}
            <DirectoryPageTitle title={catalog.title} />
          </h1>
          <PageMeta updatedAt={catalog.updated_at} />
          <Intro />
        </PageHeader>
      </EntryHero>
      <PageCanvas>
        <ToolCatalog heading="Tools" tools={catalog.tools} />
      </PageCanvas>
      {Article ? (
        <PageCanvas as="article" reading className={`${proseClassName} ${proseFlowClassName}`}>
          <Article />
        </PageCanvas>
      ) : null}
    </AppShell>
  );
}
