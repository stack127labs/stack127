import { COURSE_PAGES_TAG, PAGE_REGISTRY_TAG, HOME_PAGES_TAG, TOOL_PAGES_TAG, DIRECTORY_PAGES_TAG, TOOL_CATALOGS_TAG, TOOL_CATALOG_TAG, TOOL_PRIMARY_CATALOGS_TAG, SELF_HOST_INDEX_TAG, SELF_HOST_DETAILS_TAG, SELF_HOST_APP_TAG, CLI_APPS_TAG, SITEMAP_TAG, PLATFORM_FEES_TAG, AD_NETWORKS_TAG, LAUNCH_DIRECTORIES_TAG } from "../../../lib/cache-tags.ts";
import { networkIdentities } from "../../ad-networks/network-identities.mjs";
import { adNetworkNiches } from "../../../lib/ad-network-niches.ts";
import { feeGroups, groupPath } from "../../../lib/platform-fees/groups.ts";
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
      nextTags.add(`${PAGE_REGISTRY_TAG}:${slug || "home"}`);
      nextTags.add(`${TOOL_PAGES_TAG}:${slug}`);
      nextTags.add(`${DIRECTORY_PAGES_TAG}:${slug}`);
      nextTags.add(`${TOOL_CATALOG_TAG}:${slug}`);
      nextTags.add(TOOL_CATALOGS_TAG);
      nextTags.add(TOOL_PRIMARY_CATALOGS_TAG);
      nextTags.add(HOME_PAGES_TAG);
      nextTags.add(COURSE_PAGES_TAG);
      nextTags.add(SITEMAP_TAG);
      if (slug === "self-host-apps" || slug === "self-hosted-app-resource-planner") edgeTags.add("self-host-detail");
      if (slug === "self-hosted-app-resource-planner") addPage("/api/resource-planner-index", false);
      if (slug === "self-host-apps") {
        addPage("/api/self-host-apps/search", false);
        edgeTags.add("self-host-catalog");
      }
      // Child headings inherit these parent directory icons.
      if (slug === "keyboard-shortcuts") edgeTags.add("keyboard-shortcuts-catalog");
      if (slug === "ad-networks" || slug.startsWith("ad-networks/") || slug === "ad-network-checker") {
        edgeTags.add("ad-networks-catalog");
        addPage("/api/ad-networks/sites", false);
        addPage("/api/ad-networks/site", false);
      }
      if (slug === "cli-apps") {
        addPage("/api/cli-apps/index", false);
        edgeTags.add("cli-apps-catalog");
      }
      if (["nut-compatible-ups", "local-security-cameras", "matter-devices", "z-wave-devices", "zigbee-devices"].includes(slug)) {
        addPage(`/api/hardware-directory/${slug}`, false);
      }
      addPage("/");
      paths.add("/sitemap.xml");
      warmPaths.add("/sitemap.xml");
      edgeTags.add("sitemap");
    } else if (event.entity_type === "self_host_app") {
      nextTags.add(SELF_HOST_INDEX_TAG);
      nextTags.add(`${SELF_HOST_APP_TAG}:${slug}`);
      edgeTags.add("self-host-catalog");
      addPage("/api/self-host-apps/search", false);
      addPage("/software-licenses-for-self-hosting");
      addPage("/self-host-apps");
      addPage("/self-hosted-app-resource-planner");
      addPage("/api/resource-planner-index", false);
      addPage(`/api/self-host-apps/${slug}`, false);
      addPage(`/api/resource-planner-app/${slug}`, false);
      addPage("/");
    } else if (event.entity_type === "self_host_catalog") {
      nextTags.add(SELF_HOST_INDEX_TAG);
      nextTags.add(SELF_HOST_DETAILS_TAG);
      nextTags.add(CLI_APPS_TAG);
      addPage("/cli-apps");
      addPage("/api/cli-apps/index", false);
      edgeTags.add("cli-apps-catalog");
      addPage("/software-licenses-for-self-hosting");
      edgeTags.add("self-host-detail");
      edgeTags.add("self-host-catalog");
      addPage("/api/self-host-apps/search", false);
      addPage("/self-host-apps");
      addPage("/self-hosted-app-resource-planner");
      addPage("/api/resource-planner-index", false);
      addPage("/");
    } else if (event.entity_type === "cli_apps") {
      nextTags.add(CLI_APPS_TAG);
      addPage("/cli-apps");
      addPage("/api/cli-apps/index", false);
      edgeTags.add("cli-apps-catalog");
      addPage("/");
    } else if (event.entity_type === "platform_fees") {
      nextTags.add(PLATFORM_FEES_TAG);
      edgeTags.add("platform-fees-catalog");
      addPage("/platform-fees");
      // Refresh both the old and new category when a section moves.
      for (const group of feeGroups) addPage(groupPath(group.name));
    } else if (event.entity_type === "ad_networks") {
      nextTags.add(AD_NETWORKS_TAG);
      edgeTags.add("ad-networks-catalog");
      addPage("/ad-networks");
      addPage("/ad-networks/stats");
      addPage("/ad-networks/niches");
      addPage("/ad-network-checker");
      addPage("/api/ad-networks/sites", false);
      addPage("/api/ad-networks/site", false);
      for (const niche of adNetworkNiches) addPage(`/ad-networks/niches/${niche.slug}`);
      // Rankings, overlap and shares on every network page depend on the whole catalog.
      // New DB identities also receive their own registry page event from the report trigger.
      for (const network of networkIdentities) addPage(`/ad-networks/${network.slug}`);
      if (slug && slug !== "all") addPage(`/ad-networks/${slug}`);
    } else if (event.entity_type === "launch_directories") {
      nextTags.add(LAUNCH_DIRECTORIES_TAG);
      addPage("/launch-directories");
      addPage("/");
    } else {
      throw new Error(`Unknown cache event type: ${event.entity_type}`);
    }
  }
  if (events.some((event) => event.entity_type === "page")) {
    for (const slug of catalogSlugs) {
      const catalogSlug = clean(slug);
      addPage(`/${catalogSlug}`);
      nextTags.add(`${TOOL_CATALOG_TAG}:${catalogSlug}`);
    }
    // Catalog membership, order, and card changes alter tool-page sidebars.
    for (const slug of toolSlugs) addPage(`/${clean(slug)}`);
  }
  const verifiedApis = [...paths].filter(path => path.startsWith("/api/self-host-apps/") ||
    path.startsWith("/api/resource-planner-app/") || path === "/api/cli-apps/index" ||
    path.startsWith("/api/hardware-directory/") || path === "/api/ad-networks/sites" || path === "/api/ad-networks/site");
  return { verifyPaths: [...new Set([...warmPaths, ...verifiedApis])], paths: [...paths], nextTags: [...nextTags], edgeTags: [...edgeTags], warmPaths: [...warmPaths] };
}
