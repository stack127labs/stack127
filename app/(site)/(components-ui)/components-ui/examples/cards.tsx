"use client";

import Link from "next/link";
import { HardDrive } from "lucide-react";
import { DirectoryCard } from "@/app/ui/cards/directory-card";
import { PageCard, PageCardCounts } from "@/app/ui/cards/page-card";
import { ToolCard } from "@/app/ui/cards/tool-card";
import { DirectoryAppCard } from "@/app/ui/directories/directory-app-card";
import { HardwareFactCardContent, hardwareFactCardClassName } from "@/app/ui/directories/hardware-fact-card";
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

      <Example components={["DirectoryCard", "CatalogCard", "PageCard", "PageCardCounts"]} note="The large size for homepage collections. DirectoryCard shows counts. CatalogCard is the same card with a tool count. Without approved art, the icon shows large." source="app/ui/cards/" title="Feature card">
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

      <Example components={["DirectoryAppCard", "AppFactCardContent"]} note="A record card with an image, categories, a summary, and labeled facts. DirectoryAppCard fills AppFactCardContent from one app record." source="app/ui/directories/directory-app-card.tsx, app/ui/directories/app-fact-card.tsx" title="Record card">
        <div className={styles.cardGrid}>
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
        note="One ad network in the directory: logo, name, the confirmed-share ring, the site count, and what it takes to join. The whole card links to the network. Hover or focus the ring for its bubble; on touch screens a tap opens it. Leave join out to hide the footer. The grid goes four, three, two, then one across."
        source="app/ui/ad-networks/network-card.tsx, app/ui/ad-networks/confirmed-ring.tsx"
        title="Network card"
      >
        <SortNote>Sorted by how many <b>Food</b> sites use each network.</SortNote>
        <NetworkGrid>
          <NetworkCard confirmed={7492} href="/components-ui/cards" join="No traffic minimum" logo={{ src: "/ad-networks/logos/ezoic.png" }} name="Ezoic" sites={8144} />
          <NetworkCard confirmed={7459} href="/components-ui/cards" join="50,000 sessions a month" logo={{ src: "/ad-networks/logos/mediavine.png" }} name="Mediavine" sites={7852} />
          <NetworkCard confirmed={6437} href="/components-ui/cards" join="100,000 pageviews a month" logo={{ src: "/ad-networks/logos/raptive.png" }} name="Raptive" sites={7152} />
          <NetworkCard confirmed={6119} href="/components-ui/cards" join="1,000 sessions a month" logo={{ src: "/ad-networks/logos/journey-by-mediavine.png" }} name="Journey by Mediavine" sites={6953} />
          <NetworkCard confirmed={1} href="/components-ui/cards" logo={null} name="Publir" sites={1} />
        </NetworkGrid>
      </Example>
    </>
  );
}
