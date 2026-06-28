import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function SiteNav() {
  return (
    <header className="site-header">
      <nav className="top-nav" aria-label="Main navigation">
        <Link className="brand" href="/" aria-label="version127 home">
          <img
            alt="version127 logo"
            className="brand-logo-image brand-logo-image-light"
            height={219}
            src="/logos/version127-logo-black.png"
            width={1173}
          />
          <img
            alt="version127 logo"
            className="brand-logo-image brand-logo-image-dark"
            height={219}
            src="/logos/version127-logo-white.png"
            width={1175}
          />
        </Link>
        <div className="nav-links">
          <Link href="/self-host-apps">self-host apps</Link>
        </div>
        <div className="nav-actions">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
