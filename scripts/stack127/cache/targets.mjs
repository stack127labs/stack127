const clean = (value) => String(value ?? "").replace(/^\/+|\/+$/g, "").toLowerCase();
const pageTag = (path) => `page:${clean(path).replaceAll("/", ":") || "home"}`;

export function targetsForEvents(events, catalogSlugs = [], toolSlugs = []) {
  const paths = new Set();
  const nextTags = new Set();
  const edgeTags = new Set();
  const warmPaths = new Set();
  const addPage = (path, warm = true) => {
    paths.add(path);
    edgeTags.add(pageTag(path));
    if (warm && !path.startsWith("/api/")) warmPaths.add(path);
  };

  for (const event of events) {
    const slug = clean(event.slug);
    if (event.entity_type === "page") {
      addPage(slug ? `/${slug}` : "/");
      nextTags.add(`stack127-page:${slug || "home"}`);
      nextTags.add(`stack127-tool-page:${slug}`);
      nextTags.add(`stack127-tool-catalog:${slug}`);
      nextTags.add("stack127-tool-catalogs");
      nextTags.add("stack127-tool-primary-catalogs");
      nextTags.add("stack127-home-pages");
      nextTags.add("stack127-sitemap-pages");
      if (slug === "self-host-apps" || slug === "self-hosted-app-resource-planner") edgeTags.add("self-host-detail");
      addPage("/");
      paths.add("/sitemap.xml");
      warmPaths.add("/sitemap.xml");
      edgeTags.add("sitemap");
    } else if (event.entity_type === "self_host_app") {
      nextTags.add("stack127-self-host-apps");
      nextTags.add(`stack127-self-host-app:${slug}`);
      addPage("/software-licenses-for-self-hosting");
      addPage("/self-host-apps");
      addPage("/self-hosted-app-resource-planner");
      addPage("/api/resource-planner-index", false);
      addPage(`/api/self-host-apps/${slug}`, false);
      addPage(`/api/resource-planner-app/${slug}`, false);
      addPage("/");
    } else if (event.entity_type === "self_host_catalog") {
      nextTags.add("stack127-self-host-apps");
      nextTags.add("stack127-self-host-details");
      nextTags.add("stack127-terminal-apps");
      addPage("/cli-apps");
      addPage("/software-licenses-for-self-hosting");
      edgeTags.add("self-host-detail");
      addPage("/self-host-apps");
      addPage("/self-hosted-app-resource-planner");
      addPage("/api/resource-planner-index", false);
      addPage("/");
    } else if (event.entity_type === "cli_apps") {
      nextTags.add("stack127-terminal-apps");
      addPage("/cli-apps");
      addPage("/");
    } else {
      throw new Error(`Unknown cache event type: ${event.entity_type}`);
    }
  }
  if (events.some((event) => event.entity_type === "page")) {
    for (const slug of catalogSlugs) {
      const catalogSlug = clean(slug);
      addPage(`/${catalogSlug}`);
      nextTags.add(`stack127-tool-catalog:${catalogSlug}`);
    }
    // Catalog membership, order, and card changes alter tool-page sidebars.
    for (const slug of toolSlugs) addPage(`/${clean(slug)}`);
  }
  return { verifyPaths: [...new Set([...warmPaths, ...[...paths].filter(path => path.startsWith("/api/self-host-apps/") || path.startsWith("/api/resource-planner-app/"))])], paths: [...paths], nextTags: [...nextTags], edgeTags: [...edgeTags], warmPaths: [...warmPaths] };
}
