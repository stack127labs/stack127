import type { MDXContent } from "mdx/types";
import AppsAndSoftwareArticle from "./apps-and-software/article.mdx";
import AppsAndSoftwareIntro from "./apps-and-software/intro.mdx";
import CreativeAssetsArticle from "./creative-assets/article.mdx";
import CreativeAssetsIntro from "./creative-assets/intro.mdx";
import CreatorsAndCommunitiesArticle from "./creators-and-communities/article.mdx";
import CreatorsAndCommunitiesIntro from "./creators-and-communities/intro.mdx";
import DigitalProductsAndStoresArticle from "./digital-products-and-stores/article.mdx";
import DigitalProductsAndStoresIntro from "./digital-products-and-stores/intro.mdx";
import MusicAndAudioArticle from "./music-and-audio/article.mdx";
import MusicAndAudioIntro from "./music-and-audio/intro.mdx";
import PaymentsArticle from "./payments/article.mdx";
import PaymentsIntro from "./payments/intro.mdx";
import TeachingAndCoursesArticle from "./teaching-and-courses/article.mdx";
import TeachingAndCoursesIntro from "./teaching-and-courses/intro.mdx";
import WritingAndBooksArticle from "./writing-and-books/article.mdx";
import WritingAndBooksIntro from "./writing-and-books/intro.mdx";

/** Each fee category's own words, keyed by its slug. Add an entry when a category is added. */
export const feeCategoryContent: Record<string, { Intro: MDXContent; Article?: MDXContent }> = {
  "apps-and-software": { Intro: AppsAndSoftwareIntro, Article: AppsAndSoftwareArticle },
  "creative-assets": { Intro: CreativeAssetsIntro, Article: CreativeAssetsArticle },
  "creators-and-communities": { Intro: CreatorsAndCommunitiesIntro, Article: CreatorsAndCommunitiesArticle },
  "digital-products-and-stores": { Intro: DigitalProductsAndStoresIntro, Article: DigitalProductsAndStoresArticle },
  "music-and-audio": { Intro: MusicAndAudioIntro, Article: MusicAndAudioArticle },
  "payments": { Intro: PaymentsIntro, Article: PaymentsArticle },
  "teaching-and-courses": { Intro: TeachingAndCoursesIntro, Article: TeachingAndCoursesArticle },
  "writing-and-books": { Intro: WritingAndBooksIntro, Article: WritingAndBooksArticle },
};
