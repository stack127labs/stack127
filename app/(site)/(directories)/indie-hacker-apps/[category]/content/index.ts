import type { MDXContent } from "mdx/types";
import AnalyticsArticle from "./analytics/article.mdx";
import AnalyticsIntro from "./analytics/intro.mdx";
import AuthArticle from "./auth/article.mdx";
import AuthIntro from "./auth/intro.mdx";
import CustomerSupportArticle from "./customer-support/article.mdx";
import CustomerSupportIntro from "./customer-support/intro.mdx";
import DatabasesArticle from "./databases/article.mdx";
import DatabasesIntro from "./databases/intro.mdx";
import EmailArticle from "./email/article.mdx";
import EmailIntro from "./email/intro.mdx";
import ErrorMonitoringArticle from "./error-monitoring/article.mdx";
import ErrorMonitoringIntro from "./error-monitoring/intro.mdx";
import HostingArticle from "./hosting/article.mdx";
import HostingIntro from "./hosting/intro.mdx";
import PaymentsArticle from "./payments/article.mdx";
import PaymentsIntro from "./payments/intro.mdx";

/** Each category's own words, keyed by its slug. Add an entry when a category is added. */
export const indieCategoryContent: Record<string, { Intro: MDXContent; Article: MDXContent }> = {
  analytics: { Intro: AnalyticsIntro, Article: AnalyticsArticle },
  auth: { Intro: AuthIntro, Article: AuthArticle },
  "customer-support": { Intro: CustomerSupportIntro, Article: CustomerSupportArticle },
  databases: { Intro: DatabasesIntro, Article: DatabasesArticle },
  email: { Intro: EmailIntro, Article: EmailArticle },
  "error-monitoring": { Intro: ErrorMonitoringIntro, Article: ErrorMonitoringArticle },
  hosting: { Intro: HostingIntro, Article: HostingArticle },
  payments: { Intro: PaymentsIntro, Article: PaymentsArticle },
};
