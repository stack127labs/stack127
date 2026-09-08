import Link from "next/link";
import { proseClassName } from "@/app/prose";

export function DirectoryAffiliateDisclosure() {
  return (
    <div className={proseClassName} id="affiliate-disclosure" aria-label="Affiliate disclosure" style={{ scrollMarginTop: "calc(var(--top-bar-height) + var(--space-6))" }}>
      <p>
        Some of the links on this page are affiliate links. We earn a commission if you buy
        through one, at no extra cost to you. Affiliate commissions do not influence our
        rankings or placement. <Link href="/about#how-we-earn-money">How we earn money</Link>.
      </p>
    </div>
  );
}
