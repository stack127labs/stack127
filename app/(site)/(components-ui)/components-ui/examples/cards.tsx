"use client";

import { AhrefsCredit } from "@/app/ui/ahrefs-credit";
import Link from "next/link";
import { HardDrive } from "@/app/ui/icons";
import { CatalogCard } from "@/app/ui/cards/catalog-card";
import { DirectoryCard } from "@/app/ui/cards/directory-card";
import { PageCard, PageCardCounts } from "@/app/ui/cards/page-card";
import { ToolCard } from "@/app/ui/cards/tool-card";
import { DirectoryAppCard } from "@/app/ui/directories/directory-app-card";
import type { DirectoryAppCardData } from "@/lib/apps-card";
import { NetworkCard, NetworkGrid, SortNote } from "@/app/ui/ad-networks/network-card";
import { NetworkLogo } from "@/app/ui/ad-networks/network-logo";
import { Example } from "../gallery";
import styles from "../components-ui.module.css";

const exampleApp: DirectoryAppCardData = {
  slug: "example-photo-library",
  name: "Example photo library",
  summary: "Back up phone photos and browse them on your own server.",
  icon_url: null,
  categories: [{ name: "Photos", slug: "photos", icon_key: "images" }, { name: "Backups", slug: "backups", icon_key: "folder-sync" }],
  maintenance_status: "active",
  license: "AGPL-3.0",
  license_spdx_id: "AGPL-3.0-only",
  source_model: "open_source",
  pricing_model: "free",
  ram_min_mb: 2048,
  ram_recommended_mb: 4096,
  ram_default_limit_mb: null,
  ram_researched: true,
  storage_min_gb: 10,
  storage_profile: "high",
  storage_researched: true,
  release_published_at: "2026-09-20",
  github_last_commit_at: "2026-10-01",
  ram_estimate_min_mb: 2048,
  ram_estimate_max_mb: 4096,
  storage_estimate_min_gb: 10,
  storage_estimate_max_gb: 100,
  ram_estimated: true,
  storage_estimated: true,
};

export function CardsExamples() {
  return (
    <>
      <Example components={["ToolCard", "PageCard"]} note="PageCard at tool size, for tools in a catalog. ToolCard fills it from a tool's card fields: name, description, icon key, and art key." source="app/ui/cards/tool-card.tsx, app/ui/cards/page-card.tsx" title="Tool card">
        <div className={styles.cardGrid}>
          <ToolCard tool={{ slug: "dns-lookup", card_name: "DNS lookup", card_description: "Look up any DNS record from several public resolvers at once.", card_icon_key: "file-search", card_art_key: "dns-lookup" }} />
        </div>
      </Example>

      <Example components={["DirectoryCard", "PageCard", "PageCardCounts"]} note="The large size for homepage collections. DirectoryCard shows counts. Without approved art, the icon shows large." source="app/ui/cards/" title="Feature card">
        <div className={styles.cardGrid}>
          <DirectoryCard
            counts={[{ label: "apps", value: 1240 }, { label: "categories", value: 34 }]}
            page={{ slug: "self-host-apps", card_name: "Self-host apps", card_description: "Find apps you can run on your own server, with RAM and storage estimates.", card_icon_key: "self-host-apps", card_art_key: "self-host-apps" }}
          />
          <PageCard
            art={null}
            count={<PageCardCounts counts={[{ label: "tools", value: 12 }]} label="Example catalog stats" />}
            description="Without approved art, the card shows its icon large."
            href="/storage-tools"
            icon={HardDrive}
            name="Card without art"
          />
        </div>
      </Example>

      <Example components={["CatalogCard"]} note="A tool catalog on the homepage: icon, name, and tool count, then the first five tools in catalog order. Past five, a last row links to the catalog with the rest. No art or description." source="app/ui/cards/catalog-card.tsx" title="Catalog card">
        <div className={styles.cardGrid}>
          <CatalogCard
            catalog={{ page: { slug: "dns-tools" }, card_name: "DNS tools", card_icon_key: "network" }}
            tools={["DNS lookup", "DNS trace", "DNS change checker", "Nameserver checker", "DNSSEC checker", "MX lookup", "SPF checker"].map((name) => ({
              slug: "dns-tools",
              card_name: name,
            }))}
          />
        </div>
      </Example>

      <Example components={["DirectoryAppCard", "AppFactCardContent"]} note="A record card with an image, categories, a summary, and labeled facts. DirectoryAppCard fills AppFactCardContent from one app record." source="app/ui/directories/directory-app-card.tsx, app/ui/directories/app-fact-card.tsx" title="Record card">
        <div className={styles.cardGrid}>
          <DirectoryAppCard app={exampleApp} href="/self-host-apps" />
        </div>
      </Example>

      <Example
        components={["NetworkLogo", "networkLogo"]}
        note="An ad network's square icon on a white tile, so any icon reads in both themes. card is the 32px tile for cards and table rows; title sits in an h1 in place of the title icon. Without a logo file the tile shows the name's first letter. networkLogo(slug) finds public/ad-networks/logos/<slug>.png on the server."
        source="app/ui/ad-networks/network-logo.tsx, app/ui/ad-networks/network-logo-src.ts"
        title="Network logo"
      >
        <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 16 }}>
          <NetworkLogo logo={{ src: "/ad-networks/logos/mediavine.png" }} name="Mediavine" />
          <NetworkLogo logo={{ src: "/ad-networks/logos/raptive.png" }} name="Raptive" />
          <NetworkLogo logo={{ src: "/ad-networks/logos/newor-media.png" }} name="Newor Media" />
          <NetworkLogo logo={null} name="Sparteo" />
          <span style={{ font: "var(--weight-bold) var(--text-h1) / var(--line-h1) var(--font-display)", letterSpacing: "var(--tracking-display)" }}>
            <NetworkLogo logo={{ src: "/ad-networks/logos/mediavine.png" }} name="Mediavine" size="title" />Mediavine
          </span>
        </div>
      </Example>
      <Example
        components={["NetworkCard", "NetworkGrid", "SortNote"]}
        note="One ad network in the directory: logo, name, average Domain Rating, the site count on one line, and its top three niches. The whole card links to the network. Leave averageDr out to hide the rating, and topNiches empty to hide the footer. Show the Ahrefs credit once under the grid wherever DR shows. The grid goes five, four, three, two, then one across. Each niche row shows its NicheIcon."
        source="app/ui/ad-networks/network-card.tsx"
        title="Network card"
      >
        <SortNote>Sorted by how many <b>Food</b> sites use each network.</SortNote>
        <NetworkGrid>
          <NetworkCard averageDr={33} href="/components-ui/cards" logo={{ src: "/ad-networks/logos/ezoic.png" }} name="Ezoic" sites={8144} topNiches={[{ slug: "food", name: "Food", share: 19 }, { slug: "tech", name: "Tech", share: 10 }, { slug: "education", name: "Education", share: 8 }]} />
          <NetworkCard averageDr={33} href="/components-ui/cards" logo={{ src: "/ad-networks/logos/mediavine.png" }} name="Mediavine" sites={7852} topNiches={[{ slug: "food", name: "Food", share: 22 }, { slug: "travel", name: "Travel", share: 13 }, { slug: "lifestyle", name: "Lifestyle", share: 8 }]} />
          <NetworkCard averageDr={47} href="/components-ui/cards" logo={{ src: "/ad-networks/logos/raptive.png" }} name="Raptive" sites={7152} topNiches={[{ slug: "food", name: "Food", share: 32 }, { slug: "travel", name: "Travel", share: 5 }, { slug: "lifestyle", name: "Lifestyle", share: 5 }]} />
          <NetworkCard averageDr={28} href="/components-ui/cards" logo={{ src: "/ad-networks/logos/journey-by-mediavine.png" }} name="Journey by Mediavine" sites={6953} topNiches={[{ slug: "personal-finance", name: "Personal finance", share: 14 }, { slug: "beauty-fashion", name: "Beauty & fashion", share: 9 }, { slug: "home-diy", name: "Home & DIY", share: 0.3 }]} />
          <NetworkCard href="/components-ui/cards" logo={null} name="Publir" sites={1} />
        </NetworkGrid>
        <AhrefsCredit />
      </Example>
    </>
  );
}
