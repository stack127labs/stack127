import { AppDirectoryPage } from "@/app/ui/directories/app-directory/app-directory-page";
import Article from "./content/article.mdx";
import Intro from "./content/intro.mdx";

export default function PaymentProvidersPage() {
  return <AppDirectoryPage Article={Article} Intro={Intro} slug="payment-providers" />;
}
