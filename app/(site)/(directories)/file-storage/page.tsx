import { AppDirectoryPage } from "@/app/ui/directories/app-directory/app-directory-page";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";

export default function FileStoragePage() {
  return <AppDirectoryPage Article={Article} Intro={Intro} slug="file-storage" />;
}
