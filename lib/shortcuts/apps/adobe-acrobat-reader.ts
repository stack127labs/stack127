import type { AppShortcuts } from "../types.ts";
import { acrobatReaderGroups } from "./adobe-acrobat-pro.ts";

export const adobeAcrobatReader: AppShortcuts = {
  slug: "adobe-acrobat-reader",
  name: "Adobe Acrobat Reader",
  category: "PDF reader",
  platforms: ["windows", "macos"],
  versionContext:
    "Current Acrobat Reader desktop defaults from Adobe's September 23, 2025 Acrobat reference, checked November 1, 2026. Adobe's Reader accessibility guide states that Reader and Acrobat use the same keyboard shortcuts. Enable Use single-key accelerators to access tools for one-letter commands.",
  sourceUrl: "https://helpx.adobe.com/acrobat/desktop/get-started/preferences-and-settings/keyboard-shortcuts.html",
  sourceLabel: "Adobe Acrobat desktop keyboard shortcuts (shared with Reader)",
  lastVerified: "2026-11-01",
  groups: acrobatReaderGroups,
};

export default adobeAcrobatReader;
