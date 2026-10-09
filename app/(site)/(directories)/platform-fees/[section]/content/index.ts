import type { MDXContent } from "mdx/types";
import AppsAndSoftwareIntro from "./apps-and-software/intro.mdx";
import CreativeAssetsIntro from "./creative-assets/intro.mdx";
import CreatorsAndCommunitiesIntro from "./creators-and-communities/intro.mdx";
import DigitalProductsAndStoresIntro from "./digital-products-and-stores/intro.mdx";
import MusicAndAudioIntro from "./music-and-audio/intro.mdx";
import PaymentsIntro from "./payments/intro.mdx";
import TeachingAndCoursesIntro from "./teaching-and-courses/intro.mdx";
import WritingAndBooksIntro from "./writing-and-books/intro.mdx";

/** Each fee category's own words, keyed by its slug. Add an entry when a category is added. */
export const feeCategoryContent: Record<string, { Intro: MDXContent; Article?: MDXContent }> = {
  "apps-and-software": { Intro: AppsAndSoftwareIntro },
  "creative-assets": { Intro: CreativeAssetsIntro },
  "creators-and-communities": { Intro: CreatorsAndCommunitiesIntro },
  "digital-products-and-stores": { Intro: DigitalProductsAndStoresIntro },
  "music-and-audio": { Intro: MusicAndAudioIntro },
  "payments": { Intro: PaymentsIntro },
  "teaching-and-courses": { Intro: TeachingAndCoursesIntro },
  "writing-and-books": { Intro: WritingAndBooksIntro },
};
