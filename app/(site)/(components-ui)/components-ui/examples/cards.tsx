"use client";

import Link from "next/link";
import { CalendarDays, Code2, HardDrive, MemoryStick, WalletCards } from "lucide-react";
import { CatalogCard } from "@/app/ui/cards/catalog-card";
import { DirectoryCard } from "@/app/ui/cards/directory-card";
import { PageCard, PageCardCounts } from "@/app/ui/cards/page-card";
import { ToolCard } from "@/app/ui/cards/tool-card";
import { backup321Art } from "@/app/ui/art/backup-321";
import { AppFactCardContent, appFactCardClassName } from "@/app/ui/directories/app-fact-card";
import { DirectoryAppCard } from "@/app/ui/directories/directory-app-card";
import { HardwareFactCardContent, hardwareFactCardClassName } from "@/app/ui/directories/hardware-fact-card";
import type { DirectoryAppCardData } from "@/lib/apps-card";
import type { ToolCatalogSummary } from "@/lib/tool-catalogs";
import { Example } from "../gallery";
import styles from "../components-ui.module.css";

// CatalogCard reads only the card fields, the page slug, and the tool count.
const exampleCatalog = {
  card_name: "Storage tools",
  card_description: "Plan pools, parity, backups, and growth before you buy drives.",
  card_icon_key: null,
  card_art_key: "storage-tools",
  page: { slug: "storage-tools" },
  tool_count: 12,
} as unknown as ToolCatalogSummary;

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
      <Example components={["PageCard", "PageCardCounts"]} note="The shared linked card. The tool size fills grids. The feature size leads a page and can show counts. Without art, the icon shows large." source="app/ui/cards/page-card.tsx" title="Page card">
        <div className={styles.cardGrid}>
          <PageCard art={backup321Art} description="Estimate local and off-site backup capacity from your data and retention plan." href="/backup-321-calculator" icon={HardDrive} name="3-2-1 backup calculator" size="tool" />
          <PageCard
            art={null}
            count={<PageCardCounts counts={[{ label: "apps", value: 1240 }, { label: "categories", value: 18 }]} label="Example directory stats" />}
            description="Without approved art, the card shows its icon large."
            href="/self-host-apps"
            icon={HardDrive}
            name="Example directory"
          />
        </div>
      </Example>

      <Example components={["ToolCard", "CatalogCard", "DirectoryCard"]} note="PageCard filled from database card fields: card name, description, icon key, and art key." source="app/ui/cards/" title="Tool, catalog, and directory cards">
        <div className={styles.cardGrid}>
          <ToolCard tool={{ slug: "dns-lookup", card_name: "DNS lookup", card_description: "Look up any DNS record from several public resolvers at once.", card_icon_key: "file-search", card_art_key: "dns-lookup" }} />
          <CatalogCard catalog={exampleCatalog} />
          <DirectoryCard
            counts={[{ label: "apps", value: 1240 }, { label: "categories", value: 34 }]}
            page={{ slug: "self-host-apps", card_name: "Self-host apps", card_description: "Find apps you can run on your own server, with RAM and storage estimates.", card_icon_key: "self-host-apps", card_art_key: "self-host-apps" }}
          />
        </div>
      </Example>

      <Example components={["AppFactCardContent", "DirectoryAppCard"]} note="A record card with an image, categories, a summary, and labeled facts. DirectoryAppCard fills it from one app record." source="app/ui/directories/app-fact-card.tsx, app/ui/directories/directory-app-card.tsx" title="Record card">
        <div className={styles.cardGrid}>
          <Link className={appFactCardClassName} href="/self-host-apps">
            <AppFactCardContent
              categories={[{ name: "Home automation" }, { name: "Utilities" }]}
              facts={[
                { label: "Source", value: "open source", icon: Code2 },
                { label: "Pricing", value: "free to self-host", icon: WalletCards },
                { label: "Est. RAM", value: "2 to 4 GB", icon: MemoryStick },
                { label: "Est. Storage", value: "low", icon: HardDrive },
                { label: "Last update", value: "not recorded", icon: CalendarDays },
              ]}
              headingLevel={3}
              image={<span aria-hidden="true" className={styles.cardLogo}>H</span>}
              name="Example home server app"
              summary="Run a home dashboard and connect devices on your own server."
            />
          </Link>
          <DirectoryAppCard app={exampleApp} href="/self-host-apps" />
        </div>
      </Example>

      <Example components={["HardwareFactCardContent"]} note="A product card with a photo and short facts. A missing photo shows a placeholder." source="app/ui/directories/hardware-fact-card.tsx" title="Product card">
        <div className={styles.cardGrid}>
          <Link className={hardwareFactCardClassName} href="/zigbee-devices">
            <HardwareFactCardContent facts={[{ label: "Connection", value: "Zigbee" }, { label: "Power", value: "battery" }]} image={null} name="Example Zigbee sensor" />
          </Link>
        </div>
      </Example>
    </>
  );
}
