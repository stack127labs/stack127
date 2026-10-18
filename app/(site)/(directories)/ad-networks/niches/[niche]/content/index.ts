import type { MDXContent } from "mdx/types";
import Intro1 from "./food/intro.mdx";
import Intro2 from "./home-diy/intro.mdx";
import Intro3 from "./travel/intro.mdx";
import Intro4 from "./parenting/intro.mdx";
import Intro5 from "./personal-finance/intro.mdx";
import Intro6 from "./health-fitness/intro.mdx";
import Intro7 from "./beauty-fashion/intro.mdx";
import Intro8 from "./gaming/intro.mdx";
import Intro9 from "./tech/intro.mdx";
import Intro10 from "./crafts/intro.mdx";
import Intro11 from "./pets/intro.mdx";
import Intro12 from "./outdoors/intro.mdx";
import Intro13 from "./gardening/intro.mdx";
import Intro14 from "./sports/intro.mdx";
import Intro15 from "./entertainment/intro.mdx";
import Intro16 from "./lifestyle/intro.mdx";
import Intro17 from "./education/intro.mdx";
import Intro18 from "./automotive/intro.mdx";
import Intro19 from "./business/intro.mdx";
import Intro20 from "./news/intro.mdx";

/** Words for each niche page, keyed by niche slug. */
export const nicheContent: Record<string, { Intro: MDXContent }> = {
  "food": { Intro: Intro1 },
  "home-diy": { Intro: Intro2 },
  "travel": { Intro: Intro3 },
  "parenting": { Intro: Intro4 },
  "personal-finance": { Intro: Intro5 },
  "health-fitness": { Intro: Intro6 },
  "beauty-fashion": { Intro: Intro7 },
  "gaming": { Intro: Intro8 },
  "tech": { Intro: Intro9 },
  "crafts": { Intro: Intro10 },
  "pets": { Intro: Intro11 },
  "outdoors": { Intro: Intro12 },
  "gardening": { Intro: Intro13 },
  "sports": { Intro: Intro14 },
  "entertainment": { Intro: Intro15 },
  "lifestyle": { Intro: Intro16 },
  "education": { Intro: Intro17 },
  "automotive": { Intro: Intro18 },
  "business": { Intro: Intro19 },
  "news": { Intro: Intro20 },
};
