import {
  Activity,
  ArrowRight,
  CalendarClock,
  Code2,
  Download,
  Globe,
  Languages,
  Monitor,
  Package,
  Scale,
  Star,
  Tag,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import type { TerminalApp } from "@/lib/terminal-apps";
import { terminalAppCategories, terminalAppCategoryBySlug } from "@/lib/terminal-app-taxonomy";
import { CategoryIcon } from "@/app/ui/site/category-icon";
import { formatDate, formatList, formatStars, labelForPricing, labelForSource, labelForType } from "./cli-app-format";

type Fact = [label: string, value: string, Icon: LucideIcon];

// The server renders this for the default page, so those details are in the page HTML.
// The browser renders it for apps that only appear after filtering.
export function CliAppDetailsBody({ app }: { app: TerminalApp }) {
  const categoryLabels = new Map(
    terminalAppCategories.map((category) => [category.slug, category.name]),
  );
  const facts: Fact[] = [
    ["type", labelForType(app.primary_type), Terminal],
    ["categories", formatList(app.categories, categoryLabels), Tag],
    ["platforms", formatList(app.platforms), Monitor],
    ["install", formatList(app.install_methods), Download],
    ["language", app.language ?? "unknown", Languages],
    ["pricing", labelForPricing(app.pricing_model), Package],
    ["source model", labelForSource(app.source_model), Code2],
    ["license", app.license ?? "unknown", Scale],
    ["latest version", app.latest_version ?? "unknown", Activity],
    ["latest release", formatDate(app.latest_release_at), CalendarClock],
    ["stars", formatStars(app.stars), Star],
    ["last commit", formatDate(app.last_commit_at), CalendarClock],
    ["verified", formatDate(app.last_verified_at), Scale],
  ];

  return (
    <>
      <div className="app-detail-categories">
        <span className="category-badge">{labelForType(app.primary_type)}</span>
        {app.categories.map((category) => {
          const metadata = terminalAppCategoryBySlug.get(category);

          return (
            <span className="category-badge" key={category}>
              <CategoryIcon iconKey={metadata?.icon_key} />
              {metadata?.name ?? category}
            </span>
          );
        })}
      </div>

      <p className="app-detail-summary">{app.summary}</p>

      <div className="app-detail-primary-links">
        {app.website_url ? (
          <a className="secondary" href={app.website_url} rel="noreferrer" target="_blank">
            <span><Globe aria-hidden="true" /> website</span>
            <ArrowRight aria-hidden="true" size={14} strokeWidth={2.2} />
          </a>
        ) : null}
        {app.repository_url ? (
          <a className="primary" href={app.repository_url} rel="noreferrer" target="_blank">
            <span><FaGithub aria-hidden="true" /> source</span>
            <ArrowRight aria-hidden="true" size={14} strokeWidth={2.2} />
          </a>
        ) : null}
      </div>

      <div className="app-detail-facts">
        {facts.map(([label, value, Icon]) => (
          <div key={label}>
            <span><Icon aria-hidden="true" size={15} strokeWidth={2.2} /> {label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      {app.docs_url ? (
        <div className="app-detail-docs-link">
          <a href={app.docs_url} rel="noreferrer" target="_blank">
            Read docs and usage
            <ArrowRight aria-hidden="true" size={14} strokeWidth={2.2} />
          </a>
        </div>
      ) : null}
    </>
  );
}
