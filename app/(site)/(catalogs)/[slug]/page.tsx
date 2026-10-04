import { notFound } from "next/navigation";
import { AppShell } from "@/app/ui/site/app-shell";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { PageTitleIcon } from "@/app/ui/site/page-title-icon";
import { ToolCatalog } from "@/app/ui/catalogs/tool-catalog";
import { ToolCatalogSidebar } from "@/app/ui/catalogs/tool-catalog-sidebar";
import { DomainCatalogReference } from "./domain-catalog-reference";
import { cardArt } from "@/lib/card-art";
import { cardIcon } from "@/lib/card-icons";
import { getPublishedToolCatalog } from "@/lib/tool-catalogs";

export default async function ToolCatalogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await getPublishedToolCatalog(slug);
  if (!catalog) notFound();
  const Icon = cardIcon(catalog.card_icon_key);

  return (
    <AppShell
      mainLabel={catalog.card_name}
      menuLabel="Tool catalogs"
      sidebar={<ToolCatalogSidebar active={slug} />}
      sidebarLabel="Tool catalogs sidebar"
    >
      <EntryHero art={cardArt(catalog.hero_art_key)}>
        <PageHeader>
          <h1>
            <PageTitleIcon><Icon strokeWidth={2.2} /></PageTitleIcon>{" "}
            {catalog.heading_before}<mark>{catalog.heading_mark}</mark>{catalog.heading_after}
          </h1>
          <p>{catalog.intro}</p>
        </PageHeader>
      </EntryHero>
      <PageCanvas>
        <ToolCatalog
          heading={catalog.section_heading}
          tools={catalog.tools.map((tool) => ({
            href: `/${tool.slug}`,
            name: tool.card_name,
            description: tool.card_description,
            art: cardArt(tool.card_art_key),
            icon: cardIcon(tool.card_icon_key),
          }))}
        />
        {slug === "domain-tools" ? <DomainCatalogReference /> : null}
      </PageCanvas>
    </AppShell>
  );
}
