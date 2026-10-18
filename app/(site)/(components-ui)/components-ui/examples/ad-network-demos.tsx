"use client";

import { useState } from "react";
import type { AdNetworkSitesResponse } from "@/lib/ad-networks-types";
import { SitesTable } from "@/app/ui/ad-networks/sites-table";
import { TableToolbar, ToolbarSearch, ToolbarSelect, ToolbarSwitch } from "@/app/ui/table-toolbar";

// Working demos for the gallery. The sites table's first page is sample data; searching or
// paging asks the real development API.

export function ToolbarDemo() {
  const [hero, setHero] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("sites");
  const [niche, setNiche] = useState("");
  const [order, setOrder] = useState("used");
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div style={{ maxWidth: 760 }}>
        <ToolbarSearch label="Search ad networks, sites, and niches" onChange={setHero} placeholder="Network, site, or niche" size="large" value={hero} />
      </div>
      <TableToolbar label="Search and sort the example list">
        <ToolbarSearch label="Search sites" onChange={setQuery} placeholder="Search sites" value={query} />
        <ToolbarSelect label="Niche" onChange={setNiche} options={[{ value: "", label: "All" }, { value: "food", label: "Food" }, { value: "travel", label: "Travel" }, { value: "gaming", label: "Gaming" }]} value={niche} />
        <ToolbarSelect label="Sort" onChange={setSort} options={[{ value: "sites", label: "Most sites" }, { value: "join", label: "Easiest to join" }, { value: "niche", label: "By niche" }]} value={sort} />
      </TableToolbar>
      <ToolbarSwitch label="Order" onChange={setOrder} options={[{ value: "used", label: "Most used" }, { value: "join", label: "Easiest to join" }]} value={order} />
    </div>
  );
}

const sample: AdNetworkSitesResponse = {
  page: 1,
  pageSize: 30,
  total: 3,
  totalPages: 1,
  effectiveSort: "traffic",
  availableColumns: ["domain", "niche", "traffic", "domain_age", "platform", "manager", "checked", "publisher"],
  availableSorts: ["traffic", "oldest", "newest"],
  availableFilters: ["niche"],
  filters: { niches: [], networks: [] },
  rows: [
    { domain: "tinykitchenlab.com", publisher_name: "Tiny Kitchen Lab LLC", niche: "food", traffic_group: "top-10k", domain_created_on: "2014-03-02", platform: "WordPress", managed_by: { slug: "mediavine", name: "Mediavine" }, manager_domain: "mediavine.com", last_checked_at: "2026-10-12T08:00:00Z", favicon: null, networks: [{ slug: "mediavine", name: "Mediavine" }] },
    { domain: "wanderwithmara.com", publisher_name: null, niche: "travel", traffic_group: "top-100k", domain_created_on: "2016-07-21", platform: "WordPress", managed_by: { slug: "mediavine", name: "Mediavine" }, manager_domain: "mediavine.com", last_checked_at: "2026-10-11T08:00:00Z", favicon: null, networks: [{ slug: "mediavine", name: "Mediavine" }] },
    { domain: "budgetpantry.net", publisher_name: "Pantry Press Ltd", niche: "food", traffic_group: "top-1m", domain_created_on: "2012-01-10", platform: "Next.js", managed_by: null, manager_domain: null, last_checked_at: "2026-10-10T08:00:00Z", favicon: null, networks: [{ slug: "mediavine", name: "Mediavine" }] },
  ],
};

export function SitesTableDemo() {
  return (
    <SitesTable
      columns={["niche", "traffic", "age", "platform", "manager", "checked"]}
      defaultSort="traffic"
      heading="Sites using Mediavine"
      headingId="sites-demo"
      initial={sample}
      nicheFilter
      route="/components-ui/tables"
      scope={{ network: "mediavine" }}
      sorts={["traffic", "oldest", "newest"]}
    />
  );
}
