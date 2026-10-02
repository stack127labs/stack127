import type { ReactNode } from "react";

export const hiddenDetailsId = (prefix: string, slug: string) => `${prefix}-details-${slug}`;

// Server-rendered detail panels kept in the page HTML so search engines can read
// them. They stay hidden until the matching card opens them in the side panel.
export function HiddenDetails({ prefix, items }: { prefix: string; items: Array<{ slug: string; name: string; body: ReactNode }> }) {
  return (
    <div hidden>
      {items.map((item) => (
        <section aria-label={`${item.name} details`} id={hiddenDetailsId(prefix, item.slug)} key={item.slug}>
          <h2>{item.name}</h2>
          <div data-detail-body>{item.body}</div>
        </section>
      ))}
    </div>
  );
}

// Reads the server-rendered panel body for one app. Client-only: call after a click.
export function hiddenDetailsHtml(prefix: string, slug: string) {
  return document.getElementById(hiddenDetailsId(prefix, slug))?.querySelector("[data-detail-body]")?.innerHTML ?? null;
}
