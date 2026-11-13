import type { ComponentType } from "react";
import Intro0 from "./ai-ml/intro.mdx";
import Intro1 from "./automation/intro.mdx";
import Intro2 from "./bookmarks-read-it-later/intro.mdx";
import Intro3 from "./business-commerce/intro.mdx";
import Intro4 from "./calendars-contacts/intro.mdx";
import Intro5 from "./communication/intro.mdx";
import Intro6 from "./communities-social/intro.mdx";
import Intro7 from "./content-publishing/intro.mdx";
import Intro8 from "./dashboards/intro.mdx";
import Intro9 from "./databases/intro.mdx";
import Intro10 from "./design-creative/intro.mdx";
import Intro11 from "./developer-tools/intro.mdx";
import Intro12 from "./documents-pdfs/intro.mdx";
import Intro13 from "./ebooks-libraries/intro.mdx";
import Intro14 from "./email-newsletters/intro.mdx";
import Intro15 from "./file-sharing-sync/intro.mdx";
import Intro16 from "./finance-budgeting/intro.mdx";
import Intro17 from "./forms-polls-events/intro.mdx";
import Intro18 from "./games/intro.mdx";
import Intro19 from "./health-fitness/intro.mdx";
import Intro20 from "./home-automation-iot/intro.mdx";
import Intro21 from "./identity-access/intro.mdx";
import Intro22 from "./knowledge-notes/intro.mdx";
import Intro23 from "./learning-courses/intro.mdx";
import Intro24 from "./maps-travel/intro.mdx";
import Intro25 from "./media-device-control/intro.mdx";
import Intro26 from "./media-servers/intro.mdx";
import Intro27 from "./monitoring-status/intro.mdx";
import Intro28 from "./music-audio/intro.mdx";
import Intro29 from "./networking-dns/intro.mdx";
import Intro30 from "./password-managers/intro.mdx";
import Intro31 from "./photos-galleries/intro.mdx";
import Intro32 from "./project-task-management/intro.mdx";
import Intro33 from "./recipes-food/intro.mdx";
import Intro34 from "./remote-access/intro.mdx";
import Intro35 from "./search/intro.mdx";
import Intro36 from "./security-privacy/intro.mdx";
import Intro37 from "./storage-backup/intro.mdx";
import Intro38 from "./system-admin-hosting/intro.mdx";
import Intro39 from "./time-tracking/intro.mdx";
import Intro40 from "./video-conferencing/intro.mdx";
import Intro41 from "./wikis/intro.mdx";
import About0 from "./ai-ml/about.mdx";
import About1 from "./automation/about.mdx";
import About2 from "./bookmarks-read-it-later/about.mdx";
import About3 from "./business-commerce/about.mdx";
import About4 from "./calendars-contacts/about.mdx";
import About5 from "./communication/about.mdx";
import About6 from "./communities-social/about.mdx";
import About7 from "./content-publishing/about.mdx";
import About8 from "./dashboards/about.mdx";
import About9 from "./databases/about.mdx";
import About10 from "./design-creative/about.mdx";
import About11 from "./developer-tools/about.mdx";
import About12 from "./documents-pdfs/about.mdx";
import About13 from "./ebooks-libraries/about.mdx";
import About14 from "./email-newsletters/about.mdx";
import About15 from "./file-sharing-sync/about.mdx";
import About16 from "./finance-budgeting/about.mdx";
import About17 from "./forms-polls-events/about.mdx";
import About18 from "./games/about.mdx";
import About19 from "./health-fitness/about.mdx";
import About20 from "./home-automation-iot/about.mdx";
import About21 from "./identity-access/about.mdx";
import About22 from "./knowledge-notes/about.mdx";
import About23 from "./learning-courses/about.mdx";
import About24 from "./maps-travel/about.mdx";
import About25 from "./media-device-control/about.mdx";
import About26 from "./media-servers/about.mdx";
import About27 from "./monitoring-status/about.mdx";
import About28 from "./music-audio/about.mdx";
import About29 from "./networking-dns/about.mdx";
import About30 from "./password-managers/about.mdx";
import About31 from "./photos-galleries/about.mdx";
import About32 from "./project-task-management/about.mdx";
import About33 from "./recipes-food/about.mdx";
import About34 from "./remote-access/about.mdx";
import About35 from "./search/about.mdx";
import About36 from "./security-privacy/about.mdx";
import About37 from "./storage-backup/about.mdx";
import About38 from "./system-admin-hosting/about.mdx";
import About39 from "./time-tracking/about.mdx";
import About40 from "./video-conferencing/about.mdx";
import About41 from "./wikis/about.mdx";

// One intro (above the apps) and one about section (below the apps) per category.
export const categoryIntros: Record<string, ComponentType> = {
  "ai-ml": Intro0,
  "automation": Intro1,
  "bookmarks-read-it-later": Intro2,
  "business-commerce": Intro3,
  "calendars-contacts": Intro4,
  "communication": Intro5,
  "communities-social": Intro6,
  "content-publishing": Intro7,
  "dashboards": Intro8,
  "databases": Intro9,
  "design-creative": Intro10,
  "developer-tools": Intro11,
  "documents-pdfs": Intro12,
  "ebooks-libraries": Intro13,
  "email-newsletters": Intro14,
  "file-sharing-sync": Intro15,
  "finance-budgeting": Intro16,
  "forms-polls-events": Intro17,
  "games": Intro18,
  "health-fitness": Intro19,
  "home-automation-iot": Intro20,
  "identity-access": Intro21,
  "knowledge-notes": Intro22,
  "learning-courses": Intro23,
  "maps-travel": Intro24,
  "media-device-control": Intro25,
  "media-servers": Intro26,
  "monitoring-status": Intro27,
  "music-audio": Intro28,
  "networking-dns": Intro29,
  "password-managers": Intro30,
  "photos-galleries": Intro31,
  "project-task-management": Intro32,
  "recipes-food": Intro33,
  "remote-access": Intro34,
  "search": Intro35,
  "security-privacy": Intro36,
  "storage-backup": Intro37,
  "system-admin-hosting": Intro38,
  "time-tracking": Intro39,
  "video-conferencing": Intro40,
  "wikis": Intro41,
};

export const categoryAbouts: Record<string, ComponentType> = {
  "ai-ml": About0,
  "automation": About1,
  "bookmarks-read-it-later": About2,
  "business-commerce": About3,
  "calendars-contacts": About4,
  "communication": About5,
  "communities-social": About6,
  "content-publishing": About7,
  "dashboards": About8,
  "databases": About9,
  "design-creative": About10,
  "developer-tools": About11,
  "documents-pdfs": About12,
  "ebooks-libraries": About13,
  "email-newsletters": About14,
  "file-sharing-sync": About15,
  "finance-budgeting": About16,
  "forms-polls-events": About17,
  "games": About18,
  "health-fitness": About19,
  "home-automation-iot": About20,
  "identity-access": About21,
  "knowledge-notes": About22,
  "learning-courses": About23,
  "maps-travel": About24,
  "media-device-control": About25,
  "media-servers": About26,
  "monitoring-status": About27,
  "music-audio": About28,
  "networking-dns": About29,
  "password-managers": About30,
  "photos-galleries": About31,
  "project-task-management": About32,
  "recipes-food": About33,
  "remote-access": About34,
  "search": About35,
  "security-privacy": About36,
  "storage-backup": About37,
  "system-admin-hosting": About38,
  "time-tracking": About39,
  "video-conferencing": About40,
  "wikis": About41,
};
