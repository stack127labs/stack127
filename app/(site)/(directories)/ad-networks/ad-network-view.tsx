"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDirectoryIndex, type DirectoryIndexSource } from "@/app/ui/directories/directory-index";
import { pageParamHref, paramString, type DirectoryParams } from "@/app/ui/directories/directory-params";
import { hasDirectoryParams, useDirectoryQuery } from "@/app/ui/directories/directory-query";
import { Pagination } from "@/app/ui/pagination";
import { StatePanel } from "@/app/ui/state-panel";
import type { AdNetwork, VerifiedPublisher } from "@/lib/ad-networks";
import styles from "./page.module.css";

const publisherPageSize = 30;

// Same rules as lib/ad-networks, which can't load in the browser.
function readQuery(params: DirectoryParams) {
  return paramString(params, "q").trim().slice(0, 100);
}

function readPage(params: DirectoryParams) {
  const raw = paramString(params, "page");
  return raw && /^[1-9]\d{0,5}$/.test(raw) ? Number(raw) : 1;
}

function SearchForm({ id, label, placeholder, route }: { id: string; label: string; placeholder: string; route: string }) {
  const { params, replace } = useDirectoryQuery();
  const query = readQuery(params);
  const [value, setValue] = useState(query);
  useEffect(() => setValue(query), [query]);
  return <form
    action={route}
    className={styles.search}
    onSubmit={(event) => {
      event.preventDefault();
      const next = value.trim().slice(0, 100);
      replace(next ? `${route}?q=${encodeURIComponent(next)}` : route);
    }}
    role="search"
  >
    <label htmlFor={id}>{label}</label>
    <div className={styles.searchRow}><Search aria-hidden="true" size={18} /><input id={id} name="q" onChange={(event) => setValue(event.target.value)} placeholder={placeholder} type="search" value={value} /><button type="submit">Search</button></div>
  </form>;
}

type NetworkCard = Pick<AdNetwork, "name" | "slug" | "summary" | "verified_count">;

// All networks ship with the page. ?q= filters them in the browser.
export function AdNetworkList({ networks }: { networks: NetworkCard[] }) {
  const { params } = useDirectoryQuery();
  const needle = readQuery(params).toLowerCase();
  const matches = needle ? networks.filter((network) => network.name.toLowerCase().includes(needle) || network.slug.toLowerCase().includes(needle)) : networks;

  return <>
    <SearchForm id="ad-network-search" label="Search ad networks" placeholder="Search by network name" route="/ad-networks" />
    <div className={styles.results}><h2>Networks</h2><p>{matches.length.toLocaleString("en-US")} {matches.length === 1 ? "network" : "networks"}</p></div>
    {matches.length ? <div className={styles.grid}>{matches.map((network) => <article className={styles.card} key={network.slug}>
      <div className={styles.cardMain}><h3><Link href={`/ad-networks/${network.slug}`}>{network.name}</Link></h3><p>{network.summary ?? "Browse verified publisher websites for this network."}</p></div>
      <div className={styles.cardFoot}><span>{network.verified_count.toLocaleString("en-US")} verified {network.verified_count === 1 ? "site" : "sites"}</span><Link aria-label={`View ${network.name} publishers`} href={`/ad-networks/${network.slug}`}>View sites <span aria-hidden="true">↗</span></Link></div>
    </article>)}</div> : <StatePanel action={<Link href="/ad-networks">Show all networks</Link>} title="No networks match that search"><p>Try a shorter name or browse all networks.</p></StatePanel>}
  </>;
}

const dateFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function PublisherRows({ rows }: { rows: VerifiedPublisher[] }) {
  return <ul className={styles.siteList}>{rows.map((site) => <li key={site.normalized_domain}>
    <div><a href={`https://${site.normalized_domain}`} rel="noopener noreferrer" target="_blank">{site.display_domain} <span aria-hidden="true">↗</span></a><span className={styles.domain}>{site.normalized_domain}</span></div>
    <div className={styles.siteMeta}><span>{site.relationship_type === "primary_or_exclusive_manager" ? "Primary or exclusive monetization manager" : "Uses this network"}</span><time dateTime={new Date(site.last_confirmed_at).toISOString()}>Checked {dateFormat.format(new Date(site.last_confirmed_at))}</time></div>
  </li>)}</ul>;
}

// The static page shows the first 30 sites. ?q= and ?page= use the full list in the browser.
export function PublisherList({ firstPage, index, networkName, route, total }: {
  firstPage: VerifiedPublisher[];
  index: DirectoryIndexSource<VerifiedPublisher>;
  networkName: string;
  route: string;
  total: number;
}) {
  const { params } = useDirectoryQuery();
  const filtering = hasDirectoryParams(params, ["q", "page"]);
  const { failed, records } = useDirectoryIndex(index, filtering);
  const query = readQuery(params);
  const needle = query.toLowerCase();
  const matches = filtering && records ? records.filter((site) => site.normalized_domain.toLowerCase().includes(needle)) : null;
  const count = matches ? matches.length : total;
  const totalPages = Math.max(1, Math.ceil(count / publisherPageSize));
  const currentPage = Math.max(1, Math.min(readPage(params), totalPages));
  const rows = matches ? matches.slice((currentPage - 1) * publisherPageSize, currentPage * publisherPageSize) : firstPage;
  const hrefForPage = (page: number) => pageParamHref(route, query ? { q: query } : {}, page);

  let body;
  if (filtering && !records) {
    body = failed
      ? <StatePanel action={<Link href={route}>Show all verified sites</Link>} state="error" title="Sites could not be loaded"><p>Reload the page to try again.</p></StatePanel>
      : <StatePanel state="loading" title="Loading verified sites" />;
  } else if (rows.length) {
    body = <>
      <PublisherRows rows={rows} />
      <Pagination ariaLabel={`${networkName} publisher pages`} currentPage={currentPage} hrefForPage={hrefForPage} totalPages={totalPages} />
    </>;
  } else {
    body = <StatePanel action={query ? <Link href={route}>Show all verified sites</Link> : undefined} title={query ? "No verified sites match that search" : "No publisher sites verified yet"}><p>{query ? "Try another part of the domain." : "This network will show sites here after their current records confirm a relationship."}</p></StatePanel>;
  }

  return <>
    <SearchForm id="publisher-search" label="Search verified sites" placeholder="Search a domain" route={route} />
    <div className={styles.results}><h2>Verified sites</h2><p>{count.toLocaleString("en-US")} {count === 1 ? "site" : "sites"}</p></div>
    {body}
  </>;
}
