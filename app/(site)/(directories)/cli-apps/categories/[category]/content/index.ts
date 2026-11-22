import type { ComponentType } from "react";
import Intro0 from "./development/intro.mdx";
import Intro1 from "./devops/intro.mdx";
import Intro2 from "./files/intro.mdx";
import Intro3 from "./text/intro.mdx";
import Intro4 from "./networking/intro.mdx";
import Intro5 from "./security/intro.mdx";
import Intro6 from "./monitoring/intro.mdx";
import Intro7 from "./databases/intro.mdx";
import Intro8 from "./media-graphics/intro.mdx";
import Intro9 from "./productivity/intro.mdx";
import Intro10 from "./communication/intro.mdx";
import Intro11 from "./games-fun/intro.mdx";
import Intro12 from "./terminal-ui/intro.mdx";
import Intro13 from "./ai/intro.mdx";
import About0 from "./development/about.mdx";
import About1 from "./devops/about.mdx";
import About2 from "./files/about.mdx";
import About3 from "./text/about.mdx";
import About4 from "./networking/about.mdx";
import About5 from "./security/about.mdx";
import About6 from "./monitoring/about.mdx";
import About7 from "./databases/about.mdx";
import About8 from "./media-graphics/about.mdx";
import About9 from "./productivity/about.mdx";
import About10 from "./communication/about.mdx";
import About11 from "./games-fun/about.mdx";
import About12 from "./terminal-ui/about.mdx";
import About13 from "./ai/about.mdx";

// One intro (above the apps) and one about section (below the apps) per category.
export const categoryIntros: Record<string, ComponentType> = {
  "development": Intro0,
  "devops": Intro1,
  "files": Intro2,
  "text": Intro3,
  "networking": Intro4,
  "security": Intro5,
  "monitoring": Intro6,
  "databases": Intro7,
  "media-graphics": Intro8,
  "productivity": Intro9,
  "communication": Intro10,
  "games-fun": Intro11,
  "terminal-ui": Intro12,
  "ai": Intro13,
};

export const categoryAbouts: Record<string, ComponentType> = {
  "development": About0,
  "devops": About1,
  "files": About2,
  "text": About3,
  "networking": About4,
  "security": About5,
  "monitoring": About6,
  "databases": About7,
  "media-graphics": About8,
  "productivity": About9,
  "communication": About10,
  "games-fun": About11,
  "terminal-ui": About12,
  "ai": About13,
};
