import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { getLaunchDirectorySnapshot, launchCategories, listLaunchDirectorySlugs, type LaunchDirectory } from "@/lib/launch-directories";
import { launchDirectoryHasFreeOption, sortLaunchDirectories } from "@/lib/launch-directories-query";
import { DirectoryPageTitle } from "@/app/ui/directories/directory-page-content";
import { AppShell, SidebarLabel } from "@/app/ui/site/app-shell";
import { CategoryIcon } from "@/app/ui/site/category-icon";
import { EntryHero } from "@/app/ui/site/entry-hero";
import { PageCanvas } from "@/app/ui/site/page-canvas";
import { PageHeader } from "@/app/ui/site/page-header";
import { SidebarList } from "@/app/ui/site/sidebar-list";
import { sidebarPanelClassName, sidebarPanelHeadingClassName } from "@/app/ui/site/sidebar-panel";
import { LaunchCard, LaunchGrid, launchHref } from "../launch-card";
import { correctionEmail, linkOptions } from "../launch-directory-options";
import {
  costShort, domainOf, formatDate, formatPrice, formatShortDate, isSubmitReady, launchSectionNav, linkShort,
  shortUrl, submitStatusText, trafficLabels, trafficSteps, waitShort,
} from "../launch-format";
import { LaunchLogo } from "../launch-logo";
import { AhrefsCredit } from "../ahrefs-credit";
import styles from "./directory.module.css";

// Build every place during the release. A place without a published registry row still returns 404.
export async function generateStaticParams() {
  return (await listLaunchDirectorySlugs()).map((slug) => ({ slug }));
}

const categoryMap = Object.fromEntries(launchCategories.map((category) => [category.value, category]));

const linkMeaning: Partial<Record<LaunchDirectory["link_type_kind"], string>> = {
  dofollow: "Nothing on the sampled link tells search engines to skip it.",
  nofollow: "The link asks search engines not to follow it.",
  ugc: "The link is marked as user-generated content, which search engines treat like nofollow.",
  sponsored: "The link is marked as paid.",
  multiple: "The sampled link carried more than one value, such as ugc and nofollow.",
  varies: "Free, paid, or top-ranked listings get different links.",
  estimated_nofollow: "We couldn't read a sampled link, but other evidence points to nofollow.",
  none: "The sampled listing doesn't link to the maker's own site.",
};

const billingWords: Record<string, string> = { once: "once", week: "a week", month: "a month", year: "a year", listing: "per listing" };

const observationMethods = {
  public_page: "Their public page",
  signed_in_flow: "Our submission",
  email: "Email about our submission",
};

type Tile = { label: string; value: string | null; note?: ReactNode; meter?: number | null };

function Tiles({ label, tiles }: { label: string; tiles: Tile[] }) {
  const known = tiles.filter((tile) => tile.value);
  if (!known.length) return null;
  return <div className={styles.tileGroup}>
    <p className={styles.tilesLabel}>{label}</p>
    <dl className={styles.tiles} style={{ gridTemplateColumns: `repeat(${known.length}, minmax(0, 1fr))` }}>
      {known.map((tile) => <div key={tile.label}>
        <dt>{tile.label}</dt>
        <dd>
          {tile.meter ? <span aria-hidden="true" className={styles.meter}>{[1, 2, 3, 4, 5].map((step) => <i data-on={step <= (tile.meter ?? 0) || undefined} key={step} />)}</span> : null}
          {tile.value}
        </dd>
        {tile.note ? <dd className={styles.tileNote}>{tile.note}</dd> : null}
      </div>)}
    </dl>
  </div>;
}

function Section({ children, id, lede, title }: { children: ReactNode; id: string; lede?: ReactNode; title: string }) {
  return <section aria-labelledby={`${id}-title`} className={styles.section} id={id}>
    <h2 id={`${id}-title`}>{title}</h2>
    {lede ? <p className={styles.lede}>{lede}</p> : null}
    {children}
  </section>;
}

/** The last step in words that match what we actually found on a live listing. */
function listingStep(directory: LaunchDirectory) {
  const kind = directory.link_type_kind;
  const text = kind === "dofollow" || kind === "nofollow" || kind === "ugc" || kind === "sponsored"
    ? <>Your page stays up and links to your site with a <b>{linkShort(directory)?.toLowerCase()}</b> link.</>
    : kind === "none" ? <>Your page stays up, but the listing we checked doesn&apos;t link to the maker&apos;s site.</>
      : kind === "varies" ? <>Your page stays up. The link type depends on your plan.</>
        : kind === "multiple" ? <>Your page stays up. The link we checked carried more than one value.</>
          : kind === "estimated_nofollow" ? <>Your page stays up. The link is likely nofollow; we couldn&apos;t read it.</>
            : null;
  return text ? { title: "Your listing", text } : null;
}

function requirementsOf(directory: LaunchDirectory) {
  const details = directory.submission_details;
  if (!details || !launchDirectoryHasFreeOption(directory)) return [];
  const labels = [...details.requirements];
  if (!labels.some((label) => /backlink/i.test(label))) {
    if (details.backlink === "required") labels.unshift("Backlink required");
    else if (details.backlink === "optional") labels.unshift("Backlink optional");
    else if (details.backlink === "not_required") labels.unshift("No backlink needed");
  }
  return labels;
}

export default async function LaunchDirectoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ directories }, pagedSlugs] = await Promise.all([getLaunchDirectorySnapshot(), listLaunchDirectorySlugs()]);
  const paged = new Set(pagedSlugs);
  const directory = directories.find((item) => item.slug === slug);
  if (!directory) notFound();
  const [directoryPage, breadcrumbs] = await Promise.all([
    getRequiredDirectoryPage(`launch-directories/${slug}`),
    getBreadcrumbs(`launch-directories/${slug}`),
  ]);

  const category = categoryMap[directory.categories[0] ?? ""];
  const ready = isSubmitReady(directory);
  const details = directory.submission_details;
  const checked = formatDate(directory.checked_on);

  /* ---------- Facts ---------- */
  const listing: Tile[] = [
    {
      label: "Cost",
      value: directory.cost_kind === "free_and_paid" ? "Free" : costShort(directory),
      note: directory.cost_kind === "free_and_paid"
        ? directory.lowest_paid_price_usd ? `Paid options from ${formatPrice(directory.lowest_paid_price_usd)}` : "Paid options too"
        : directory.cost_note,
    },
    { label: "Review time", value: waitShort(directory), note: launchDirectoryHasFreeOption(directory) ? "Free path" : null },
    { label: "Link type", value: linkShort(directory), note: directory.link_type_kind === "varies" ? "Depends on the plan" : null },
  ];
  const site: Tile[] = [
    { label: "Domain rating", value: directory.domain_rating === null ? null : String(directory.domain_rating), note: <><AhrefsCredit />{directory.domain_rating_checked_on ? `, ${formatShortDate(directory.domain_rating_checked_on)}` : null}</> },
    { label: "Popularity", value: directory.traffic_bucket ? trafficLabels[directory.traffic_bucket] : null, note: "Tranco list", meter: directory.traffic_bucket ? trafficSteps[directory.traffic_bucket] : null },
    { label: "Listing pages indexed", value: directory.listing_indexed === null ? null : directory.listing_indexed ? "Yes" : "No", note: "In Google" },
  ];
  const unstated = listing.filter((tile) => !tile.value).map((tile) => tile.label.toLowerCase());
  const unchecked = site.filter((tile) => !tile.value).map((tile) => tile.label.toLowerCase());

  /* ---------- Pricing ---------- */
  const tiers = directory.price_tiers;
  const showPricing = tiers.length > 1 || tiers.some((tier) => (tier.price_usd ?? 0) > 0);
  const tierLinks = tiers.some((tier) => tier.link_type);
  const linkLabels = new Map(linkOptions.map((option) => [option.value, option.card]));

  /* ---------- Who can submit ---------- */
  const requirements = requirementsOf(directory);

  /* ---------- How a launch works ---------- */
  const reviewText = details?.review_time ?? (directory.review_time_label && !/^not stated/i.test(directory.review_time_label) ? directory.review_time_label : null);
  const steps = [
    ready ? { title: "Submit", text: <>Fill in the form on <b>{domainOf(directory.submit_url ?? directory.website_url)}</b>.</> } : null,
    reviewText ? { title: "Review", text: <>{reviewText}</> } : null,
    details?.launch_queue ? { title: "Launch slot", text: <>{details.launch_queue}</> } : null,
    listingStep(directory),
  ].filter((step) => step !== null);

  /* ---------- Similar places ---------- */
  // Only places with a published page of their own, so nothing here links to a 404.
  const others = directories.filter((item) => item.slug !== slug && paged.has(item.slug) && category && item.categories.includes(category.value));
  const byStrength = sortLaunchDirectories(others, "dr");
  const similar = byStrength.slice(0, 3);
  const more = byStrength.slice(3, 9);

  const sources = directory.source_links;
  const subject = encodeURIComponent(`Correction: ${directory.name} on launch directories`);

  const jumps = [
    { id: "facts", label: "Key facts" },
    showPricing ? { id: "pricing", label: "Pricing" } : null,
    { id: "who-can-submit", label: "Who can submit" },
    steps.length > 1 ? { id: "how-it-works", label: "How it works" } : null,
    { id: "link", label: "Link check" },
    details?.observations.length ? { id: "what-we-saw", label: "What we saw" } : null,
    { id: "sources", label: "Sources" },
    similar.length ? { id: "similar", label: "Similar places" } : null,
  ].filter((jump) => jump !== null);

  const sidebar = <div className={sidebarPanelClassName}>
    <div className={sidebarPanelHeadingClassName}><SidebarLabel>{directory.name}</SidebarLabel></div>
    <nav aria-label="On this page">
      <p className={styles.sideLabel}>On this page</p>
      <SidebarList items={jumps.map((jump) => ({ href: `#${jump.id}`, label: jump.label }))} />
    </nav>
    {category && more.length ? <nav aria-label={`More ${category.label.toLowerCase()}`}>
      <p className={styles.sideLabel}>More {category.label.toLowerCase()}</p>
      <SidebarList items={more.map((item) => ({
        href: launchHref(item.slug),
        label: item.name,
        icon: <LaunchLogo iconUrl={item.icon_url} name={item.name} size="row" />,
        count: item.domain_rating === null ? undefined : String(item.domain_rating),
      }))} />
      {more.some((item) => item.domain_rating !== null) ? <p className={styles.sideCredit}><AhrefsCredit prefix="Numbers are" /></p> : null}
      <p className={styles.sideMore}><Link href={`/launch-directories?category=${category.value}`} prefetch={false}>All {category.label.toLowerCase()}</Link></p>
    </nav> : null}
  </div>;

  return <AppShell
    mainLabel={`${directory.name} launch listing`}
    menuLabel="On this page"
    sectionNav={launchSectionNav("/launch-directories")}
    sidebar={sidebar}
    sidebarLabel={`${directory.name} sidebar`}
  >
    <EntryHero art={null}>
      <PageHeader breadcrumbs={breadcrumbs} className={styles.header}>
        <h1><LaunchLogo eager iconUrl={directory.icon_url} name={directory.name} size="title" /><DirectoryPageTitle title={directoryPage.title} /></h1>
        <p>{directory.summary}</p>
        <div className={styles.meta}>
          {category ? <span><CategoryIcon iconKey={category.iconKey} />{category.label}</span> : null}
          {checked ? <span>Checked {checked}</span> : null}
          {!ready ? <span className={styles.status}>{submitStatusText(directory)}</span> : null}
        </div>
        <div className={styles.actions}>
          {ready ? <a className={styles.primary} href={directory.submit_url ?? undefined} rel="noopener noreferrer" target="_blank">
            Submit your product <ArrowRight aria-hidden="true" size={16} strokeWidth={2.2} />
          </a> : null}
          <a className={ready ? styles.secondary : styles.primary} href={directory.website_url} rel="noopener noreferrer" target="_blank">
            Visit {domainOf(directory.website_url)} <ExternalLink aria-hidden="true" size={15} strokeWidth={2.2} />
          </a>
        </div>
      </PageHeader>
    </EntryHero>

    <PageCanvas flow>
      <section aria-label="Key facts" className={styles.facts} id="facts">
        <Tiles label="Listing" tiles={listing} />
        <Tiles label="Their site" tiles={site} />
        {unstated.length ? <p className={styles.gapLine}>Not stated on their site: {unstated.join(", ")}.</p> : null}
        {unchecked.length ? <p className={styles.gapLine}>Not checked yet: {unchecked.join(", ")}.</p> : null}
      </section>

      {showPricing ? <Section id="pricing" lede="As listed on their own pricing page." title="Pricing">
        <div className={styles.tableFrame}>
          <table className={styles.table}>
            <thead><tr><th scope="col">Plan</th><th scope="col">Price</th><th scope="col">What you get</th>{tierLinks ? <th scope="col">Link</th> : null}</tr></thead>
            <tbody>
              {tiers.map((tier) => <tr key={tier.name}>
                <th scope="row">{tier.name}</th>
                <td className={styles.mono}>{tier.price_usd === null ? <span className={styles.muted}>Not stated</span> : tier.price_usd === 0 ? "Free" : <>{formatPrice(tier.price_usd)}{tier.billing ? <span className={styles.muted}> {billingWords[tier.billing]}</span> : null}</>}</td>
                <td>{tier.gets ?? <span className={styles.muted}>Not stated</span>}</td>
                {tierLinks ? <td className={styles.mono}>{tier.link_type ? linkLabels.get(tier.link_type) ?? tier.link_type : <span className={styles.muted}>Not stated</span>}</td> : null}
              </tr>)}
            </tbody>
          </table>
        </div>
      </Section> : null}

      <Section id="who-can-submit" title="Who can submit">
        <div className={styles.rule}>
          <p className={styles.ruleLabel}>Their rule</p>
          <p className={styles.ruleText}>{directory.eligibility_label}</p>
          <p className={styles.ruleNote}>Best for: {directory.best_for}</p>
        </div>
        {requirements.length ? <div className={styles.needs}>
          <p className={styles.ruleLabel}>The free plan asks for</p>
          <ul>{requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul>
        </div> : null}
      </Section>

      {steps.length > 1 ? <Section id="how-it-works" lede="From their own pages. Times are what they state." title="How a launch works here">
        <ol className={styles.steps}>
          {steps.map((step) => <li key={step.title}><b>{step.title}</b><p>{step.text}</p></li>)}
        </ol>
      </Section> : null}

      <Section id="link" lede="What a live listing links to, from one published listing we opened." title="Link check">
        <div className={styles.linkCheck}>
          <p className={styles.linkKind}>{linkShort(directory) ?? "Couldn't verify"}</p>
          {directory.link_type_label.trim().toLowerCase() !== (linkShort(directory) ?? "").toLowerCase() ? <p>{directory.link_type_label}</p> : null}
          {linkMeaning[directory.link_type_kind] ? <p className={styles.muted}>{linkMeaning[directory.link_type_kind]}</p> : null}
          {directory.example_listing_url ? <p className={styles.mono}>Sample listing: <a href={directory.example_listing_url} rel="noopener noreferrer" target="_blank">{shortUrl(directory.example_listing_url)}</a></p> : null}
        </div>
      </Section>

      {details?.observations.length ? <Section id="what-we-saw" lede="Dated notes from their pages and from our own submission. Your dates may differ." title="What we saw">
        <ul className={styles.dated}>
          {details.observations.map((observation, index) => <li key={index}>
            <span className={styles.mono}>{formatShortDate(observation.checked_at)}</span>
            <div>
              <p>{observation.text}</p>
              <p className={styles.muted}>{observationMethods[observation.method]}{observation.source_url ? <> · <a href={observation.source_url} rel="noopener noreferrer" target="_blank">{shortUrl(observation.source_url)}</a></> : null}</p>
            </div>
          </li>)}
        </ul>
      </Section> : null}

      <Section id="sources" lede="The pages we read for these facts." title="Sources">
        {sources.length || directory.example_listing_url ? <ul className={styles.dated}>
          {sources.map((source) => <li key={`${source.label}-${source.url}`}>
            <span className={styles.mono}>{formatDate(source.checked_on) ?? ""}</span>
            <div><p>{source.label} · <a href={source.url} rel="noopener noreferrer" target="_blank">{shortUrl(source.url)}</a></p></div>
          </li>)}
          {directory.example_listing_url ? <li>
            <span className={styles.mono} />
            <div><p>Sample listing · <a href={directory.example_listing_url} rel="noopener noreferrer" target="_blank">{shortUrl(directory.example_listing_url)}</a></p></div>
          </li> : null}
        </ul> : <p className={styles.muted}>No public source links for this place yet.</p>}
      </Section>

      {similar.length ? <Section id="similar" lede={category ? `More ${category.label.toLowerCase()}, strongest sites first.` : undefined} title="Similar places">
        <LaunchGrid>
          {similar.map((item) => <LaunchCard category={categoryMap[item.categories[0] ?? ""]} directory={item} key={item.slug} />)}
        </LaunchGrid>
      </Section> : null}

      <p className={styles.fix}>
        {"See something wrong or out of date? "}
        <a href={`mailto:${correctionEmail}?subject=${subject}`}>Tell us</a>
        {" and we'll check it again. "}
        <Link href={`/launch-directories/compare?d=${slug}`} prefetch={false}>Compare {directory.name} with others</Link>.
      </p>
    </PageCanvas>
  </AppShell>;
}
