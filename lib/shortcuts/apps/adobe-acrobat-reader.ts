import type { AppShortcuts } from "../types.ts";
import { acrobatReaderGroups } from "./adobe-acrobat-pro.ts";

export const adobeAcrobatReader: AppShortcuts = {
  slug: "adobe-acrobat-reader",
  name: "Adobe Acrobat Reader",
  category: "PDF reader",
  platforms: ["windows", "macos"],
  intro:
    "Adobe documents one desktop keyboard map for Acrobat Reader and Acrobat. This Reader reference keeps the viewing, commenting, form-entry, search, portfolio, navigation, and accessibility commands, while leaving Acrobat-only authoring tools on the Acrobat Pro page.",
  versionContext:
    "Current Acrobat Reader desktop defaults checked August 31, 2026. Adobe's June 21, 2026 Reader accessibility guide states that Reader and Acrobat use the same keyboard shortcuts and links to the September 23, 2025 Acrobat table. Enable Use single-key accelerators to access tools for one-letter commands.",
  sourceUrl: "https://helpx.adobe.com/reader/desktop/accessibility-features.html",
  sourceLabel: "official Adobe Acrobat Reader keyboard shortcuts",
  lastVerified: "2026-08-31",
  groups: acrobatReaderGroups,
};

export default adobeAcrobatReader;
