import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppBySlug, type AppDetail, type Screenshot } from "@/lib/apps";
import { SiteNav } from "../../site-nav";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function isImageUrl(url: string) {
  return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url);
}

function getYoutubeId(url: string | null) {
  if (!url) {
    return null;
  }

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }

    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }

  return null;
}

function formatNumber(value: number | null) {
  if (value === null) {
    return "unknown";
  }

  return new Intl.NumberFormat("en", {
    notation: value > 9999 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value: Date | null) {
  if (!value) {
    return "not checked";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function splitParagraphs(value: string | null) {
  return value
    ? value.split(/\n+/).map((part) => part.trim()).filter(Boolean)
    : [];
}

function AppIcon({ app }: { app: AppDetail }) {
  return (
    <div className="detail-icon" aria-hidden="true">
      {app.icon_url ? <img alt="" src={app.icon_url} /> : app.name.slice(0, 1)}
    </div>
  );
}

function LinkButton({
  href,
  children,
  kind = "secondary",
}: {
  href: string | null;
  children: ReactNode;
  kind?: "primary" | "secondary";
}) {
  if (!href) {
    return null;
  }

  return (
    <a className={`detail-action ${kind}`} href={href} rel="noreferrer" target="_blank">
      {children}
    </a>
  );
}

function NarrativeList({ items }: { items: string[] }) {
  return (
    <ul className="narrative-list">
      {items.slice(0, 4).map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function MediaPreview({ screenshots }: { screenshots: Screenshot[] }) {
  const imageScreenshots = screenshots.filter((item) => isImageUrl(item.url));
  const heroImage = imageScreenshots[0];

  if (!heroImage) {
    return (
      <div className="media-preview placeholder-preview">
        <span>preview coming soon</span>
      </div>
    );
  }

  return (
    <div className="media-preview">
      <img alt={heroImage.caption ?? "App screenshot"} src={heroImage.url} />
      {heroImage.caption ? <p>{heroImage.caption}</p> : null}
    </div>
  );
}

function DetailTextBlock({ title, value }: { title: string; value: string | null }) {
  const paragraphs = splitParagraphs(value);

  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <section className="story-section">
      <div className="section-kicker">{title}</div>
      <div className="section-copy">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

export default async function AppDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const app = await getAppBySlug(slug);

  if (!app) {
    notFound();
  }

  const youtubeId = getYoutubeId(app.youtube_video_url);
  const imageScreenshots = app.screenshots.filter((item) => isImageUrl(item.url));
  const setupSignals = [
    app.deployment_methods[0],
    app.requires_database ? app.database_types.join(", ") || "database" : null,
    app.requires_redis ? "redis" : null,
    app.compose_support ? "compose ready" : null,
  ].filter(Boolean);

  return (
    <>
      <SiteNav />

      <main className="site-shell detail-shell">
        <div className="breadcrumb">
          <Link href="/">home</Link>
          <span>/</span>
          <Link href="/">apps</Link>
          <span>/</span>
          <strong>{app.slug}</strong>
        </div>

        <section className="detail-hero">
          <div className="detail-hero-copy">
            <div className="detail-title-row">
              <AppIcon app={app} />
              <div>
                <p className="category-chip">{app.category_name ?? "self-hosted app"}</p>
                <h1>{app.name}</h1>
              </div>
            </div>

            <p className="detail-description">{app.description}</p>

            <div className="detail-actions">
              <LinkButton href={app.website_url} kind="primary">
                official site
              </LinkButton>
              <LinkButton href={app.install_docs_url}>install docs</LinkButton>
              <LinkButton href={app.source_code_url}>source code</LinkButton>
            </div>

            <div className="signal-row" aria-label="Setup signals">
              {setupSignals.map((signal) => (
                <span key={signal}>{signal}</span>
              ))}
            </div>
          </div>

          <MediaPreview screenshots={app.screenshots} />
        </section>

        <section className="fit-strip" aria-label="Fit and watch-outs">
          <div>
            <h2>Good fit</h2>
            <NarrativeList items={app.good_fit} />
          </div>
          <div>
            <h2>Watch-outs</h2>
            <NarrativeList items={app.watch_outs} />
          </div>
        </section>

        <DetailTextBlock title="HomeLabHQ verdict" value={app.verdict} />

        <section className="setup-story">
          <div className="section-kicker">Get started</div>
          <div className="setup-steps">
            {splitParagraphs(app.get_started).map((paragraph, index) => (
              <div className="setup-step" key={paragraph}>
                <span>{index + 1}</span>
                <p>{paragraph}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="media-story">
          <div className="section-heading-row">
            <div>
              <div className="section-kicker">See it in action</div>
              <h2>screenshots first, video when useful.</h2>
            </div>
          </div>
          <div className="media-grid">
            <div className="screenshot-strip">
              {imageScreenshots.slice(0, 3).map((screenshot) => (
                <figure key={screenshot.url}>
                  <img alt={screenshot.caption ?? "App screenshot"} src={screenshot.url} />
                  {screenshot.caption ? <figcaption>{screenshot.caption}</figcaption> : null}
                </figure>
              ))}
            </div>
            {youtubeId ? (
              <div className="video-frame">
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={`${app.name} video`}
                />
              </div>
            ) : null}
          </div>
        </section>

        <section className="running-story">
          <div className="section-kicker">Running this app</div>
          <div className="runtime-grid">
            <div>
              <strong>{app.deployment_methods.join(", ") || "deployment varies"}</strong>
              <span>normal install path</span>
            </div>
            <div>
              <strong>
                {app.ram_recommended_mb
                  ? `${app.ram_recommended_mb / 1024}GB RAM`
                  : "RAM varies"}
              </strong>
              <span>practical starting point</span>
            </div>
            <div>
              <strong>{app.database_types.join(", ") || "no database listed"}</strong>
              <span>data services</span>
            </div>
          </div>
          <div className="runtime-notes">
            {app.storage_and_data_notes ? <p>{app.storage_and_data_notes}</p> : null}
            {app.cpu_notes ? <p>{app.cpu_notes}</p> : null}
            {app.gpu_notes ? <p>{app.gpu_notes}</p> : null}
          </div>
        </section>

        <section className="backup-story">
          <div>
            <div className="section-kicker">Backup matters here</div>
            <h2>{app.backup_criticality ?? "unknown"} data criticality</h2>
          </div>
          <div className="backup-copy">
            {splitParagraphs(app.backup_details).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {app.raid_notes ? <p className="raid-note">{app.raid_notes}</p> : null}
          </div>
        </section>

        <section className="project-health">
          <div>
            <strong>{formatNumber(app.github_stars)}</strong>
            <span>stars</span>
          </div>
          <div>
            <strong>{formatNumber(app.github_forks)}</strong>
            <span>forks</span>
          </div>
          <div>
            <strong>{app.github_latest_release ?? "unknown"}</strong>
            <span>latest release</span>
          </div>
          <div>
            <strong>{formatNumber(app.github_release_count)}</strong>
            <span>releases tracked</span>
          </div>
          <p>Last checked {formatDate(app.github_checked_at ?? app.last_checked_at)}</p>
        </section>

        <section className="links-story">
          <div>
            <div className="section-kicker">Useful links</div>
            <div className="plain-link-row">
              <LinkButton href={app.website_url}>official site</LinkButton>
              <LinkButton href={app.docs_url}>docs</LinkButton>
              <LinkButton href={app.docker_url}>docker image</LinkButton>
              <LinkButton href={app.demo_url}>demo</LinkButton>
            </div>
          </div>

          {app.client_apps.length > 0 ? (
            <div>
              <div className="section-kicker">Client apps</div>
              <div className="client-row">
                {app.client_apps.map((client) => (
                  <a href={client.url} key={`${client.platform}-${client.url}`} target="_blank">
                    {client.platform}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        {(app.replaces_apps.length > 0 || app.alternatives.length > 0) && (
          <section className="related-story">
            {app.replaces_apps.length > 0 ? (
              <div>
                <div className="section-kicker">Can replace</div>
                <div className="soft-word-row">
                  {app.replaces_apps.map((name) => (
                    <span key={name}>{name}</span>
                  ))}
                </div>
              </div>
            ) : null}
            {app.alternatives.length > 0 ? (
              <div>
                <div className="section-kicker">Related self-hosted apps</div>
                <div className="related-apps">
                  {app.alternatives.map((alternative) => (
                    <Link href={`/apps/${alternative.slug}`} key={alternative.slug}>
                      {alternative.icon_url ? <img alt="" src={alternative.icon_url} /> : null}
                      <span>{alternative.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        )}
      </main>
    </>
  );
}
