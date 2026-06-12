import { ThemeToggle } from "./theme-toggle";

const apps = [
  {
    name: "Immich",
    description: "Photo and video backup for your own server.",
    icon: "immich",
    tags: ["open source", "docker", "mobile"],
  },
  {
    name: "Nextcloud",
    description: "Files, calendars, notes, and collaboration.",
    icon: "nextcloud",
    tags: ["open source", "docker", "web"],
  },
  {
    name: "Jellyfin",
    description: "Personal media server for movies and music.",
    icon: "jellyfin",
    tags: ["open source", "docker", "media"],
  },
  {
    name: "Home Assistant",
    description: "Open-source home automation platform.",
    icon: "homeassistant",
    tags: ["open source", "docker", "iot"],
  },
  {
    name: "Vaultwarden",
    description: "Lightweight password manager server.",
    icon: "vaultwarden",
    tags: ["open source", "docker", "security"],
  },
  {
    name: "Paperless-ngx",
    description: "Document management for scanned files.",
    icon: "paperless",
    tags: ["open source", "docker", "docs"],
  },
  {
    name: "NocoDB",
    description: "Turn databases into smart spreadsheets.",
    icon: "nocodb",
    tags: ["open source", "docker", "web"],
  },
  {
    name: "Uptime Kuma",
    description: "Self-hosted uptime and monitoring tracker.",
    icon: "kuma",
    tags: ["open source", "docker", "monitoring"],
  },
];

const categories = ["All apps", "Media", "Productivity", "Security", "Monitoring", "More"];

function AppLogo({ type }: { type: string }) {
  return <span className={`app-logo ${type}`} aria-hidden="true" />;
}

function AppCard({ app }: { app: (typeof apps)[number] }) {
  return (
    <article className="app-card">
      <button className="save-button" aria-label={`Save ${app.name}`}>
        <span />
      </button>
      <div className="app-card-main">
        <AppLogo type={app.icon} />
        <div>
          <h3>{app.name}</h3>
          <p>{app.description}</p>
        </div>
      </div>
      <div className="tag-row">
        {app.tags.map((tag) => (
          <span className={`tag ${tag.replace(/\s+/g, "-")}`} key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <main className="site-shell">
      <nav className="top-nav" aria-label="Main navigation">
        <a className="brand" href="#">
          homelabhq<span>.</span>
        </a>
        <div className="nav-links">
          <a href="#">apps</a>
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
          <a className="browse-button" href="#">
            browse apps <span>{"->"}</span>
          </a>
        </div>
      </nav>

      <section className="hero-grid" aria-labelledby="page-title">
        <div className="hero-copy">
          <span className="doodle doodle-one" aria-hidden="true" />
          <h1 id="page-title">
            find the best <br />
            <span className="hero-emphasis">self-hosted apps</span>
            <span className="hero-dot">.</span>
          </h1>
          <p>
            Discover, compare, and run self-hosted software with full control
            over your data.
          </p>
          <div className="proof-points">
            <span>privacy first</span>
            <span>open source</span>
            <span>community driven</span>
          </div>
        </div>

        <aside className="hero-card" aria-label="Community stats">
          <span className="doodle ring-top" aria-hidden="true" />
          <span className="doodle ring-bottom" aria-hidden="true" />
          <div className="hero-pill">community curated</div>
          <div className="stat-grid">
            <div>
              <strong>2400+</strong>
              <span>apps tracked</span>
            </div>
            <div>
              <strong>80+</strong>
              <span>categories</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>self-hosted</span>
            </div>
          </div>
          <div className="community-row">
            <div className="avatar-stack" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <p>Find practical apps for privacy, media, automation, and more.</p>
          </div>
          <div className="server-scene" aria-hidden="true">
            <div className="plant">
              <span />
            </div>
            <div className="server-stack">
              <span />
              <span />
            </div>
            <div className="app-tiles">
              <span />
              <span />
              <span />
            </div>
            <div className="storage-bin" />
          </div>
        </aside>
      </section>

      <section className="browse-row" aria-label="Browse apps">
        <label className="search-box">
          <span aria-hidden="true" />
          <input placeholder="Search apps, features, or categories..." />
        </label>
        <div className="category-strip">
          <span className="browse-label">or browse by</span>
          {categories.map((category, index) => (
            <button className={index === 0 ? "active" : ""} key={category}>
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="content-grid" aria-label="Featured self-hosted apps">
        <aside className="collection-card">
          <span className="collection-pill">featured collection</span>
          <h2>privacy essentials</h2>
          <p>A handpicked set of apps to help you take back control of your data.</p>
          <a href="#">
            explore collection <span>{"->"}</span>
          </a>
          <div className="lock-art" aria-hidden="true">
            <span />
          </div>
        </aside>

        <div className="app-grid">
          {apps.map((app) => (
            <AppCard app={app} key={app.name} />
          ))}
        </div>
      </section>

      <section className="confidence-strip" aria-label="HomeLabHQ promises">
        <div className="confidence-icon" aria-hidden="true">
          <span />
        </div>
        <div className="confidence-copy">
          <h2>self-host with confidence.</h2>
          <p>Every app is reviewed for privacy, setup, and long-term practicality.</p>
        </div>
        <div className="confidence-point">
          <strong>curated & reviewed</strong>
          <span>Practical notes for real setups.</span>
        </div>
        <div className="confidence-point">
          <strong>easy to deploy</strong>
          <span>Docker and compose signals.</span>
        </div>
        <div className="confidence-point">
          <strong>always useful</strong>
          <span>Open-source focused, no fluff.</span>
        </div>
      </section>
    </main>
  );
}
