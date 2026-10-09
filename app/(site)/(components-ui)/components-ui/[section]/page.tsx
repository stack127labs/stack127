import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import { ActionsAndFormsExamples } from "../examples/actions-and-forms";
import { CardsExamples } from "../examples/cards";
import { ChartsExamples } from "../examples/charts";
import { ContentExamples } from "../examples/content";
import { EChartsTrialExamples } from "../examples/echarts-trial";
import { FeedbackAndDialogsExamples } from "../examples/feedback-and-dialogs";
import { FileUploadsExamples } from "../examples/file-uploads";
import { FiltersAndSortingExamples } from "../examples/filters-and-sorting";
import { MediaAndArtExamples } from "../examples/media-and-art";
import { NavigationExamples } from "../examples/navigation";
import { NumbersAndSlidersExamples } from "../examples/numbers-and-sliders";
import { PageLayoutExamples } from "../examples/page-layout";
import { ResultsExamples } from "../examples/results";
import { TablesExamples } from "../examples/tables";
import { TextAndChoicesExamples } from "../examples/text-and-choices";
import { GalleryPage } from "../gallery";
import { gallerySection } from "../sections";

const examples: Record<string, ComponentType> = {
  "text-and-choices": TextAndChoicesExamples,
  "numbers-and-sliders": NumbersAndSlidersExamples,
  "actions-and-forms": ActionsAndFormsExamples,
  "file-uploads": FileUploadsExamples,
  "filters-and-sorting": FiltersAndSortingExamples,
  results: ResultsExamples,
  tables: TablesExamples,
  charts: ChartsExamples,
  "echarts-trial": EChartsTrialExamples,
  cards: CardsExamples,
  content: ContentExamples,
  "media-and-art": MediaAndArtExamples,
  "feedback-and-dialogs": FeedbackAndDialogsExamples,
  navigation: NavigationExamples,
  "page-layout": PageLayoutExamples,
};

export default async function ComponentSectionPage({ params }: { params: Promise<{ section: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { section: slug } = await params;
  const section = gallerySection(slug);
  const Examples = examples[slug];
  if (!section || !Examples) notFound();

  return <GalleryPage section={section}><Examples /></GalleryPage>;
}
