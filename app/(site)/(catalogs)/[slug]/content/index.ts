import type { MDXContent } from "mdx/types";
import DeveloperToolsIntro from "./developer-tools/intro.mdx";
import DnsToolsIntro from "./dns-tools/intro.mdx";
import DomainToolsIntro from "./domain-tools/intro.mdx";
import HostingCloudToolsIntro from "./hosting-cloud-tools/intro.mdx";
import KdpToolsIntro from "./kdp-tools/intro.mdx";
import ProductivityToolsIntro from "./productivity-tools/intro.mdx";
import SaasToolsIntro from "./saas-tools/intro.mdx";
import StorageToolsIntro from "./storage-tools/intro.mdx";

/** Each catalog's own words, keyed by its slug. Add an entry before a catalog is published. */
export const catalogContent: Record<string, { Intro: MDXContent; Article?: MDXContent }> = {
  "developer-tools": { Intro: DeveloperToolsIntro },
  "dns-tools": { Intro: DnsToolsIntro },
  "domain-tools": { Intro: DomainToolsIntro },
  "hosting-cloud-tools": { Intro: HostingCloudToolsIntro },
  "kdp-tools": { Intro: KdpToolsIntro },
  "productivity-tools": { Intro: ProductivityToolsIntro },
  "saas-tools": { Intro: SaasToolsIntro },
  "storage-tools": { Intro: StorageToolsIntro },
};
