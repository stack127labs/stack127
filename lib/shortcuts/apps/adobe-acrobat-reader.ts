import type { AppShortcuts } from "../types.ts";
import { acrobatReaderGroups } from "./adobe-acrobat-pro.ts";

export const adobeAcrobatReader: AppShortcuts = {
  slug: "adobe-acrobat-reader",
  name: "Adobe Acrobat Reader",
  category: "PDF reader",
  platforms: ["windows", "macos"],
  versionContext:
    "Reader and Acrobat use the same shortcuts. Turn on Use single-key accelerators to access tools for the one-letter commands.",
  sourceUrl: "https://helpx.adobe.com/acrobat/desktop/get-started/preferences-and-settings/keyboard-shortcuts.html",
  sourceLabel: "Adobe Acrobat desktop keyboard shortcuts (shared with Reader)",
  lastVerified: "2026-11-02",
  groups: acrobatReaderGroups,
};

export default adobeAcrobatReader;
