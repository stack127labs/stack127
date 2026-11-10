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
