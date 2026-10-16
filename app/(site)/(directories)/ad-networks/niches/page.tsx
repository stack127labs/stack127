import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { getAdNetworkNichesPageData } from "@/lib/ad-networks";
import { getExactPublishedPage } from "@/lib/page-registry";
import { RegistryStructuredData } from "@/lib/registry-layout";
import { NichesView } from "./niches-view";

export default async function AdNetworkNichesPage() {
  const [directoryPage, data, breadcrumbs] = await Promise.all([
    getRequiredDirectoryPage("ad-networks/niches"),
    getAdNetworkNichesPageData(),
    getBreadcrumbs("ad-networks/niches"),
  ]);
  // Link a niche only once its own page is published.
  const published = new Set<string | null>((await Promise.all(data.niches.map(async (niche) =>
    (await getExactPublishedPage(`ad-networks/niches/${niche.slug}`)) ? niche.slug : null))).filter(Boolean));

  return (
    <>
      <RegistryStructuredData path="/ad-networks/niches" />
      <NichesView
        breadcrumbs={breadcrumbs}
        data={data}
        nicheHref={(slug) => (published.has(slug) ? `/ad-networks/niches/${slug}` : undefined)}
        title={directoryPage.title}
        updatedAt={directoryPage.updated_at}
      />
    </>
  );
}
