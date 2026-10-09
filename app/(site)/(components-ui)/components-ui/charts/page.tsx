import { notFound } from "next/navigation";
import { ChartsExamples } from "../examples/charts";
import { GalleryPage } from "../gallery";
import { gallerySection } from "../sections";

/** The Charts section has its own route, so only this page loads the interactive chart code. */
export default function ChartsSectionPage() {
  const section = gallerySection("charts");
  if (process.env.NODE_ENV !== "development" || !section) notFound();
  return <GalleryPage section={section}><ChartsExamples /></GalleryPage>;
}
