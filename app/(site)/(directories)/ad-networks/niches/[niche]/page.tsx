import { notFound } from "next/navigation";
import { adNetworkNiches } from "@/lib/ad-network-niches";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { getRequiredDirectoryPage } from "@/lib/directory-pages";
import { getAdNetworkNichePageData } from "@/lib/ad-networks";
import { nicheContent } from "./content";
import { NicheView } from "./niche-view";

// Build every niche during the release. Unpublished niches still return 404.
export function generateStaticParams() {
  return adNetworkNiches.map((niche) => ({ niche: niche.slug }));
}

export default async function AdNetworkNichePage({ params }: { params: Promise<{ niche: string }> }) {
  const { niche: slug } = await params;
  const content = nicheContent[slug];
  if (!content) throw new Error(`Ad network niche has no MDX content: ${slug}`);
  const [directoryPage, data, breadcrumbs] = await Promise.all([
    getRequiredDirectoryPage(`ad-networks/niches/${slug}`),
    getAdNetworkNichePageData(slug),
    getBreadcrumbs(`ad-networks/niches/${slug}`),
  ]);
  // data-gate: the niche run sorts sites into this niche; until it reaches coverage the loader returns null.
  if (!data) notFound();

  return <NicheView breadcrumbs={breadcrumbs} data={data} Intro={content.Intro} title={directoryPage.title} updatedAt={directoryPage.updated_at} />;
}
