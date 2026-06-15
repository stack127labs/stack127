import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function SiteNav() {
  return (
    <nav className="top-nav" aria-label="Main navigation">
      <Link className="brand" href="/">
        homelabhq<span>.</span>
      </Link>
      <div className="nav-links">
        <Link href="/self-host-apps">apps</Link>
        <a href="#">categories</a>
        <a href="#">compare</a>
        <a href="#">guides</a>
        <a href="#">blog</a>
      </div>
      <div className="nav-actions">
        <ThemeToggle />
        <button className="icon-button" aria-label="Saved apps">
          <span className="bookmark-icon" />
        </button>
        <Link className="browse-button" href="/self-host-apps">
          browse apps <span>{"->"}</span>
        </Link>
      </div>
    </nav>
  );
}
