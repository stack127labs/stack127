/**
 * Software licenses for self-hosters.
 * Single source of truth for the verdict table, sidebar anchors, and cards.
 * Written for people who run apps and people who publish them.
 * Not legal advice. Prefer official license text when decisions matter.
 */

export type LicenseGroupId =
  | "permissive"
  | "public-domain"
  | "weak-copyleft"
  | "strong-copyleft"
  | "source-available"
  | "cc-content"
  | "patterns";

export type LicenseGroup = {
  id: LicenseGroupId;
  title: string;
  sidebarLabel: string;
  /** One line that frames the family before its cards. */
  intro: string;
};

/**
 * One-word answers for the verdict table.
 * yes: the activity is permitted; routine notices or attribution may still apply.
 * careful: the activity is permitted with a material obligation such as source
 * disclosure, share-alike, or a competition limit.
 * depends: project-specific parameters, a chosen option, or separate terms decide.
 * no: blocked by the license.
 */
export type Verdict = "yes" | "no" | "careful" | "depends";

/** OSI column values. "pd" is a public-domain dedication that works like open source. */
export type OsiVerdict = "yes" | "no" | "pd" | "n.a." | "depends";

export type LicenseVerdicts = {
  selfHost: Verdict;
  companyUse: Verdict;
  osi: OsiVerdict;
  service: Verdict;
  modify: Verdict;
  redistribute: Verdict;
  /** Copyleft class: none, weak, strong, network, service, delayed, share-alike, mixed, depends, or n.a. */
  copyleft: string;
};

export type LicenseCondition = {
  label: string;
  text: string;
};

export type LicenseEntry = {
  id: string;
  name: string;
  sidebarLabel: string;
  group: LicenseGroupId;
  /** Short SPDX or common id shown beside the card title. */
  spdx: string | null;
  /** The OSI standing line under the card title, e.g. "OSI open source". */
  osiNote: string | null;
  summary: string;
  verdicts: LicenseVerdicts;
  /** The exact condition behind every careful, depends, or no. */
  conditions: LicenseCondition[];
  /** One short block for people running the app. */
  forUsers: string;
  /** One short block for people licensing their own app. */
  forCreators: string;
  commonMistake: string | null;
  officialUrl: string | null;
  /** Override when the URL is guidance, a family site, or an example rather than license text. */
  officialLinkLabel?: string;
  /** Strings that may appear in self_host_apps.license for matching. */
  aliases: string[];
};

export const licensePage = {
  title: "Software licenses for self-hosting",
  lede:
    "Compare the licenses used by self-hosted apps. See whether you can run each app at home or at work, modify it, redistribute it, or host it for other people.",
  notLegalAdvice:
    "This is a practical guide, not legal advice. If money, customers, or a commercial product are involved, read the project's LICENSE file and get legal help when you need it.",
};

export const licenseGroups: LicenseGroup[] = [
  {
    id: "permissive",
    title: "Permissive licenses",
    sidebarLabel: "Permissive",
    intro:
      "Run it, change it, sell it, keep your fork private forever. The only real duty is keeping copyright notices when you redistribute.",
  },
  {
    id: "public-domain",
    title: "Public domain dedications",
    sidebarLabel: "Public domain",
    intro:
      "Fine to run, with almost nothing to comply with. The real question is what part of the project they actually cover.",
  },
  {
    id: "weak-copyleft",
    title: "Weak copyleft licenses",
    sidebarLabel: "Weak copyleft",
    intro:
      "Free to use anywhere. The share-back duty is scoped: changes to the covered files or library stay open when you ship them, the rest of your product stays yours.",
  },
  {
    id: "strong-copyleft",
    title: "Strong and network copyleft",
    sidebarLabel: "Strong / network",
    intro:
      "The whole program stays free software. GPL triggers when you distribute it. AGPL, EUPL, and OSL also trigger when people reach your modified version over a network.",
  },
  {
    id: "source-available",
    title: "Source-available and restricted",
    sidebarLabel: "Source-available",
    intro:
      "Code you can read and usually self-host, with terms that put it outside the open-source definition. SSPL conditions service use on releasing service source, while BSL, FSL, and PolyForm depend on project parameters or competition limits.",
  },
  {
    id: "cc-content",
    title: "Creative Commons and content licenses",
    sidebarLabel: "CC / content",
    intro:
      "You will meet these on docs, wikis, diagrams, and media packs around self-hosting, not usually on the app backend itself. The first question is always which part of the project they cover.",
  },
  {
    id: "patterns",
    title: "Patterns, not licenses",
    sidebarLabel: "Patterns",
    intro: "Three shapes you will meet on directory cards that are not single licenses at all.",
  },
];

export const licenses: LicenseEntry[] = [
  // --- Permissive ---
  {
    id: "mit",
    name: "MIT License",
    sidebarLabel: "MIT",
    group: "permissive",
    spdx: "MIT",
    osiNote: "OSI open source",
    summary:
      "MIT lets you use, change, sell, or host the software with almost no friction. Keep the copyright and license notice when you pass the code or a package to someone else.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "yes",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    conditions: [
      { label: "Notices", text: "Ship the MIT copyright and permission notice with any distribution." },
    ],
    forUsers:
      "About as easy as licenses get. Run the official image, change config, keep a private fork, share nothing.",
    forCreators:
      "Pick MIT when you want companies and everyone else to reuse your code with almost no conditions, knowing it will not stop a cloud host from selling your app as a service.",
    commonMistake:
      "Assuming MIT means the project has no paid edition. Plenty of apps are MIT at the core and charge for enterprise modules or hosted plans.",
    officialUrl: "https://opensource.org/license/mit",
    aliases: ["MIT", "MIT License", "MIT Expat"],
  },
  {
    id: "apache-2-0",
    name: "Apache License 2.0",
    sidebarLabel: "Apache-2.0",
    group: "permissive",
    spdx: "Apache-2.0",
    osiNote: "OSI open source",
    summary:
      "Apache-2.0 gives you MIT-like freedom with explicit patent protection. Keep the license, copyright notices, and any NOTICE file when you redistribute it.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "yes",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    conditions: [
      { label: "Modify", text: "Mark modified files as changed when you redistribute them." },
      {
        label: "Notices",
        text: "Keep the license text, copyright lines, and NOTICE file contents in anything you ship.",
      },
    ],
    forUsers:
      "Feels like MIT. The extra notice rules only bite if you repackage the software and hand that package to someone else.",
    forCreators:
      "Pick Apache-2.0 for permissive reuse plus an explicit patent grant. Most infrastructure and foundation projects choose it for exactly that reason.",
    commonMistake:
      "Treating Apache-2.0 and MIT as identical when shipping a product. For private self-hosting they are the same. For redistribution, Apache asks for real care with notices.",
    officialUrl: "https://www.apache.org/licenses/LICENSE-2.0",
    aliases: ["Apache-2.0", "Apache 2.0", "Apache License 2.0"],
  },
  {
    id: "bsd-2-clause",
    name: "BSD 2-Clause License",
    sidebarLabel: "BSD-2-Clause",
    group: "permissive",
    spdx: "BSD-2-Clause",
    osiNote: "OSI open source",
    summary:
      "BSD-2-Clause lets you use and change the software freely. Keep the copyright notice and disclaimer when you redistribute it.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "yes",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    conditions: [
      { label: "Notices", text: "Keep the copyright notice and disclaimer in source and binary distributions." },
    ],
    forUsers: "Behaves like MIT. Home labs and internal company installs are fine.",
    forCreators:
      "A clean permissive option with simple terms. Check the repo actually uses the 2-clause text and not another BSD variant.",
    commonMistake:
      "Assuming every BSD label is the same. The 2-clause, 3-clause, and older 4-clause texts differ.",
    officialUrl: "https://opensource.org/license/bsd-2-clause",
    aliases: ["BSD-2-Clause", "BSD 2-Clause", "FreeBSD"],
  },
  {
    id: "bsd-3-clause",
    name: "BSD 3-Clause License",
    sidebarLabel: "BSD-3-Clause",
    group: "permissive",
    spdx: "BSD-3-Clause",
    osiNote: "OSI open source",
    summary:
      "BSD-2-Clause plus one rule: you may not use the original author's name to promote your product without permission.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "yes",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    conditions: [
      { label: "Notices", text: "Keep required notices. Do not imply the original authors endorse your product." },
    ],
    forUsers: "Identical day-to-day freedom to the other permissive licenses.",
    forCreators:
      "Useful when you want permissive reuse but still want to stop people implying you endorse their product.",
    commonMistake: null,
    officialUrl: "https://opensource.org/license/bsd-3-clause",
    aliases: ["BSD-3-Clause", "BSD 3-Clause", "New BSD", "Modified BSD"],
  },
  {
    id: "isc",
    name: "ISC License",
    sidebarLabel: "ISC",
    group: "permissive",
    spdx: "ISC",
    osiNote: "OSI open source",
    summary:
      "A short permissive license that works like MIT in practice: use it, change it, keep the notice when you redistribute.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "yes",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    conditions: [
      { label: "Notices", text: "Keep the copyright and permission notice with distributions." },
    ],
    forUsers: "No self-host traps. Treat it as MIT.",
    forCreators:
      "Fine when you want a short permissive text, though MIT and Apache-2.0 are more familiar to company legal teams.",
    commonMistake: null,
    officialUrl: "https://opensource.org/license/isc-license-txt",
    aliases: ["ISC", "ISC License"],
  },
  {
    id: "zlib",
    name: "zlib License",
    sidebarLabel: "Zlib",
    group: "permissive",
    spdx: "Zlib",
    osiNote: "OSI open source",
    summary:
      "Permissive and commercial-friendly, as long as you do not misrepresent where the code came from and you mark altered versions.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "yes",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    conditions: [
      { label: "Modify", text: "Do not misrepresent the origin. Mark altered versions where required." },
      { label: "Notices", text: "Do not claim you wrote the original. Keep origin credit." },
    ],
    forUsers:
      "zlib usually shows up as a library underneath an app rather than as the app's own license. Self-hosting is fine either way.",
    forCreators:
      "Reasonable for libraries. For a full self-host app, MIT or Apache-2.0 are clearer to contributors and companies.",
    commonMistake: null,
    officialUrl: "https://opensource.org/license/zlib",
    aliases: ["Zlib", "zlib", "Libpng"],
  },

  // --- Public domain dedications ---
  {
    id: "unlicense",
    name: "The Unlicense",
    sidebarLabel: "Unlicense",
    group: "public-domain",
    spdx: "Unlicense",
    osiNote: "OSI open source",
    summary:
      "A public-domain style dedication. Where it works as intended, you can use, change, and share the software with almost no conditions.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "yes",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    conditions: [],
    forUsers: "Nothing to worry about.",
    forCreators:
      "Maximum reuse, almost no protection. Many creators prefer MIT because company legal teams understand it better.",
    commonMistake: null,
    officialUrl: "https://unlicense.org/",
    aliases: ["Unlicense"],
  },
  {
    id: "cc0-1-0",
    name: "CC0 1.0 Universal",
    sidebarLabel: "CC0-1.0",
    group: "public-domain",
    spdx: "CC0-1.0",
    osiNote: "Public-domain dedication, not on the OSI list",
    summary:
      "A Creative Commons public-domain dedication. Common for data and documentation, sometimes used to waive copyright on code as far as the law allows.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "pd",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    conditions: [],
    forUsers: "Fine. Remember CC0 clears copyright, not trademarks.",
    forCreators:
      "Great for datasets, configs, and docs. For application source, MIT or Apache-2.0 create fewer patent surprises.",
    commonMistake:
      "Reaching for CC0 on code because it looks maximally free. It says nothing useful about patents.",
    officialUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    aliases: ["CC0-1.0", "CC0", "CC0 1.0"],
  },
  {
    id: "wtfpl",
    name: "WTFPL",
    sidebarLabel: "WTFPL",
    group: "public-domain",
    spdx: "WTFPL",
    osiNote: "Not OSI-approved",
    summary: "An informal do-what-you-want license. In practice it is as free as anything on this page.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "no",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    conditions: [],
    forUsers:
      "Fine for small utilities in a home lab, and legally fine at work too. The obstacle is policy, not permission: some legal teams reject the text outright as too unclear to rely on.",
    forCreators: "If you want permissive terms people can actually clear internally, use MIT.",
    commonMistake: null,
    officialUrl: "http://www.wtfpl.net/about/",
    aliases: ["WTFPL"],
  },

  // --- Weak copyleft ---
  {
    id: "mpl-2-0",
    name: "Mozilla Public License 2.0",
    sidebarLabel: "MPL-2.0",
    group: "weak-copyleft",
    spdx: "MPL-2.0",
    osiNote: "OSI open source",
    summary:
      "Weak, file-level copyleft. You can combine MPL code with other code, but distributed changes to MPL-covered files stay under MPL with source available.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "yes",
      service: "yes",
      modify: "careful",
      redistribute: "careful",
      copyleft: "weak",
    },
    conditions: [
      { label: "Modify", text: "Share modifications to MPL files if you distribute those files." },
      { label: "Redistribute", text: "MPL files stay under MPL. Other files can use other licenses." },
      { label: "Service", text: "Usually fine. Hosting alone is not the trigger." },
      { label: "Notices", text: "Keep MPL notices on covered files and offer source for distributed MPL changes." },
    ],
    forUsers:
      "Easy. Source-sharing starts when you distribute modified packages, not when you run the app for yourself.",
    forCreators:
      "Pick MPL when you want fixes to your files shared back without forcing entire combined products to become MPL. It sits between MIT and GPL.",
    commonMistake:
      "Treating MPL like AGPL. Hosting a service does not force your whole stack open under MPL.",
    officialUrl: "https://www.mozilla.org/en-US/MPL/2.0/",
    aliases: ["MPL-2.0", "MPL 2.0", "Mozilla Public License 2.0"],
  },
  {
    id: "lgpl-2-1",
    name: "GNU Lesser General Public License 2.1",
    sidebarLabel: "LGPL-2.1",
    group: "weak-copyleft",
    spdx: "LGPL-2.1",
    osiNote: "OSI open source",
    summary:
      "Weak copyleft built for libraries. You can link it into other software more flexibly than GPL, but changes to the LGPL library itself get shared when you distribute them.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "yes",
      service: "yes",
      modify: "careful",
      redistribute: "careful",
      copyleft: "weak",
    },
    conditions: [
      { label: "Modify", text: "Distributed library changes stay under LGPL." },
      {
        label: "Redistribute",
        text: "Source rules apply to the LGPL portion, plus linking details if you ship a product.",
      },
      { label: "Service", text: "Hosting is fine. Shipping modified binaries is where the duties appear." },
      { label: "Notices", text: "Provide notices and corresponding source for the LGPL parts you distribute." },
    ],
    forUsers:
      "Run it at home or work without drama. If you ship a custom image containing modified LGPL libraries, plan to offer that library source.",
    forCreators:
      "Better suited to libraries than to full apps. For a complete self-host application, AGPL or GPL send a clearer signal.",
    commonMistake:
      "Reading LGPL as if it were MIT. It is friendlier than GPL for libraries and it is still copyleft.",
    officialUrl: "https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html",
    aliases: ["LGPL-2.1", "LGPL 2.1", "LGPLv2.1"],
  },
  {
    id: "lgpl-3-0",
    name: "GNU Lesser General Public License 3.0",
    sidebarLabel: "LGPL-3.0",
    group: "weak-copyleft",
    spdx: "LGPL-3.0",
    osiNote: "OSI open source",
    summary:
      "The newer library license. Same share-alike idea as LGPL-2.1, updated terms around combining and installing the library.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "yes",
      service: "yes",
      modify: "careful",
      redistribute: "careful",
      copyleft: "weak",
    },
    conditions: [
      { label: "Modify", text: "Distributed library changes stay under LGPL-3.0." },
      { label: "Redistribute", text: "LGPL-3.0 source rules for the library portion." },
      {
        label: "Service",
        text: "Private and company hosting are fine. Binary distribution triggers the detailed duties.",
      },
    ],
    forUsers: "Same practical story as LGPL-2.1 for anyone who only runs apps.",
    forCreators:
      "Use it for libraries when you want GPL-3-era terms without forcing every combined work into full GPL.",
    commonMistake: null,
    officialUrl: "https://www.gnu.org/licenses/lgpl-3.0.html",
    aliases: ["LGPL-3.0", "LGPL 3.0", "LGPLv3", "LGPL-3.0-only", "LGPL-3.0-or-later"],
  },
  {
    id: "epl-2-0",
    name: "Eclipse Public License 2.0",
    sidebarLabel: "EPL-2.0",
    group: "weak-copyleft",
    spdx: "EPL-2.0",
    osiNote: "OSI open source",
    summary:
      "Weak copyleft, common in the Eclipse and Java tooling world. Source duties focus on the EPL modules you distribute, not on everything around them.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "yes",
      service: "yes",
      modify: "careful",
      redistribute: "careful",
      copyleft: "weak",
    },
    conditions: [
      { label: "Modify", text: "Distributed EPL changes need source under EPL terms." },
      { label: "Redistribute", text: "EPL source rules apply to covered modules." },
      {
        label: "Service",
        text: "Hosting without shipping modified EPL code is simple. Modified packages need source compliance.",
      },
    ],
    forUsers: "Fine for self-host use. For operators it behaves closer to MPL than to AGPL.",
    forCreators:
      "A natural fit inside the Eclipse and Java ecosystem. Outside it, MPL or Apache are easier for contributors to understand.",
    commonMistake: null,
    officialUrl: "https://www.eclipse.org/legal/epl-2.0/",
    aliases: ["EPL-2.0", "EPL 2.0", "EPL-1.0", "Eclipse Public License"],
  },

  // --- Strong and network copyleft ---
  {
    id: "gpl-2-0",
    name: "GNU General Public License 2.0",
    sidebarLabel: "GPL-2.0",
    group: "strong-copyleft",
    spdx: "GPL-2.0",
    osiNote: "OSI open source",
    summary:
      "GPL-2.0 lets you run and change the software freely. If you distribute it, you must provide the corresponding source under the same GPL terms.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "yes",
      service: "yes",
      modify: "careful",
      redistribute: "careful",
      copyleft: "strong",
    },
    conditions: [
      { label: "Modify", text: "Private changes are yours. Shipping modified versions brings GPL source terms." },
      { label: "Redistribute", text: "The distributed work stays under GPL-compatible terms, with source." },
      {
        label: "Service",
        text: "Running a server for users is not distribution. Shipping images, appliances, or downloads is.",
      },
      {
        label: "Notices",
        text: "Keep GPL notices and offer corresponding source when you distribute covered works.",
      },
    ],
    forUsers:
      "Normal and expected. Private changes on your own server stay private until you distribute them. Companies hit GPL when they ship appliances or custom images, not when they run the app internally.",
    forCreators:
      "Pick GPL-2.0 when distributed improvements must stay free software. If your real worry is a hosted competitor that never ships code, AGPL is the network-oriented answer.",
    commonMistake:
      "Thinking GPL bans commercial use. It does not. It requires whoever distributes the program to pass along user freedom and source access.",
    officialUrl: "https://www.gnu.org/licenses/old-licenses/gpl-2.0.html",
    aliases: ["GPL-2.0", "GPL 2.0", "GPLv2", "GPL-2.0-only", "GPL-2.0-or-later"],
  },
  {
    id: "gpl-3-0",
    name: "GNU General Public License 3.0",
    sidebarLabel: "GPL-3.0",
    group: "strong-copyleft",
    spdx: "GPL-3.0",
    osiNote: "OSI open source",
    summary:
      "GPL-3.0 lets you run and change the software freely, but anything you distribute must keep the same source-sharing freedom. It adds clearer patent protection and rules for installing modified software on locked-down devices.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "yes",
      service: "yes",
      modify: "careful",
      redistribute: "careful",
      copyleft: "strong",
    },
    conditions: [
      { label: "Modify", text: "Private use is free. Distributed versions need GPL-3.0 source terms." },
      { label: "Redistribute", text: "GPL-3.0 share-alike rules with corresponding source." },
      { label: "Service", text: "Network hosting alone is not the AGPL trigger. Distribution still is." },
    ],
    forUsers:
      "If you only run the upstream Docker image, GPL-3.0 rarely changes your day. Forking the project and shipping a commercial appliance is where the duties start.",
    forCreators:
      "A solid copyleft default without AGPL's network trigger. Many self-host apps still pick AGPL because hosted SaaS clones are the more common risk than boxed appliances.",
    commonMistake:
      "Using GPL and AGPL as if they were the same. AGPL adds a network rule that GPL does not express.",
    officialUrl: "https://www.gnu.org/licenses/gpl-3.0.html",
    aliases: ["GPL-3.0", "GPL 3.0", "GPLv3", "GPL-3.0-only", "GPL-3.0-or-later"],
  },
  {
    id: "agpl-3-0",
    name: "GNU Affero General Public License 3.0",
    sidebarLabel: "AGPL-3.0",
    group: "strong-copyleft",
    spdx: "AGPL-3.0",
    osiNote: "OSI open source",
    summary:
      "AGPL-3.0 works like GPL but also protects people using a modified version over a network. If you change the hosted app, offer those users the corresponding source.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "yes",
      service: "careful",
      modify: "careful",
      redistribute: "careful",
      copyleft: "network",
    },
    conditions: [
      {
        label: "Modify",
        text: "Private changes are fine. Network use of a modified version triggers a source offer to those users.",
      },
      { label: "Redistribute", text: "AGPL share-alike rules apply." },
      {
        label: "Service",
        text: "Allowed, but modified network services must offer corresponding source. Companies that want closed changes usually buy a commercial license instead.",
      },
      {
        label: "Notices",
        text: "Keep AGPL notices and provide corresponding source, including for network use of modified versions.",
      },
    ],
    forUsers:
      "Running stock AGPL software for your family or your company is exactly how these apps expect to be used. The hard case is offering a modified service to outsiders without sharing the source.",
    forCreators:
      "The common choice for self-host web apps: notes tools, media apps, admin panels, collaboration software. Free for self-hosters, hard to run as a closed hosted clone, and often paired with a paid commercial license for companies that need different terms.",
    commonMistake:
      "Believing AGPL forbids self-hosting or company use. It does neither. It protects users of network services from hidden modifications.",
    officialUrl: "https://www.gnu.org/licenses/agpl-3.0.html",
    aliases: [
      "AGPL-3.0",
      "AGPL 3.0",
      "AGPLv3",
      "AGPL-3.0-only",
      "AGPL-3.0-or-later",
      "AGPL-3.0/MIT",
    ],
  },
  {
    id: "eupl-1-2",
    name: "European Union Public Licence 1.2",
    sidebarLabel: "EUPL-1.2",
    group: "strong-copyleft",
    spdx: "EUPL-1.2",
    osiNote: "OSI open source",
    summary:
      "A European copyleft license with a remote-access trigger, which is why it sits in this family rather than with the weak copyleft licenses.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "yes",
      service: "careful",
      modify: "careful",
      redistribute: "careful",
      copyleft: "network",
    },
    conditions: [
      {
        label: "Service",
        text: "EUPL treats giving remote access as a form of distribution. Offering a modified public service can require source sharing.",
      },
      { label: "Modify", text: "Distributed derivatives stay under EUPL or a listed compatible license." },
      { label: "Redistribute", text: "EUPL source and copyleft rules apply." },
    ],
    forUsers:
      "Home and internal installs are fine. Public multi-tenant hosting of a modified version needs a careful read of the text.",
    forCreators:
      "Common in EU public-sector projects. For a global self-host audience, AGPL is the more familiar network-copyleft choice.",
    commonMistake:
      "Filing EUPL next to MIT because both allow commercial use. Commercial use is allowed. Share-alike and remote-use terms still apply.",
    officialUrl: "https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12",
    aliases: ["EUPL-1.2", "EUPL 1.2", "European Union Public Licence"],
  },
  {
    id: "osl-3-0",
    name: "Open Software License 3.0",
    sidebarLabel: "OSL-3.0",
    group: "strong-copyleft",
    spdx: "OSL-3.0",
    osiNote: "OSI open source",
    summary:
      "Strong copyleft with network-use language. Less common than AGPL, similar questions when you offer software to other people.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "yes",
      service: "careful",
      modify: "careful",
      redistribute: "careful",
      copyleft: "network",
    },
    conditions: [
      {
        label: "Service",
        text: "Offering the software to third parties can trigger source sharing. Read the text before building a public service on it.",
      },
      {
        label: "Modify",
        text: "OSL share-alike duties apply when you distribute or deploy in ways the license treats as distribution.",
      },
      {
        label: "Redistribute",
        text: "Distributed copies and derivatives must follow OSL source, notice, and share-alike terms.",
      },
    ],
    forUsers: "Home and internal use are fine. Treat public service offerings carefully.",
    forCreators:
      "A valid copyleft option, but prefer AGPL unless you have a specific reason. AGPL is far better understood in the self-host world.",
    commonMistake: null,
    officialUrl: "https://opensource.org/license/osl-3-0-php",
    aliases: ["OSL-3.0", "OSL 3.0", "Open Software License 3.0"],
  },

  // --- Source-available and restricted ---
  {
    id: "sspl-1-0",
    name: "Server Side Public License 1.0",
    sidebarLabel: "SSPL-1.0",
    group: "source-available",
    spdx: "SSPL-1.0",
    osiNote: "Source-available, not OSI-approved",
    summary:
      "SSPL is comfortable for running software yourself, but offering it as a service can require releasing much of the surrounding service stack. That makes it source-available, not open source.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "no",
      service: "careful",
      modify: "careful",
      redistribute: "careful",
      copyleft: "service",
    },
    conditions: [
      {
        label: "Service",
        text: "Not forbidden outright, but conditioned on releasing the whole service stack under SSPL. For most operators that is a practical no.",
      },
      {
        label: "Modify",
        text: "You may modify the software. Distribution and service use can make SSPL source duties apply.",
      },
      {
        label: "Redistribute",
        text: "Keep the license and provide source as SSPL requires when you distribute covered copies.",
      },
      {
        label: "Notices",
        text: "Follow SSPL notices and source rules. Read section 13 before any managed offering.",
      },
    ],
    forUsers: "Self-hosting for yourself or your company is the intended free path.",
    forCreators:
      "Keeps the code readable and self-host friendly while making managed-service resale expensive. Expect pushback from some Linux distributions and enterprise open-source policies. AGPL is the OSI-approved alternative with a different edge.",
    commonMistake:
      "Seeing public source and calling the project open source. Public source plus SSPL is source-available.",
    officialUrl: "https://www.mongodb.com/legal/licensing/server-side-public-license",
    aliases: ["SSPL-1.0", "SSPL", "Server Side Public License"],
  },
  {
    id: "elastic-license-2-0",
    name: "Elastic License 2.0",
    sidebarLabel: "Elastic-2.0",
    group: "source-available",
    spdx: "Elastic-2.0",
    osiNote: "Source-available, not OSI-approved",
    summary:
      "Elastic-2.0 is meant for self-managed use and lets you modify the software. You cannot offer the product itself to others as a managed service.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "no",
      service: "no",
      modify: "careful",
      redistribute: "careful",
      copyleft: "none",
    },
    conditions: [
      {
        label: "Service",
        text: "Flat no for hosted or managed service provision. Unlike SSPL, there is no source-release path that unlocks it.",
      },
      { label: "Modify", text: "Allowed within Elastic License limits." },
      { label: "Redistribute", text: "Limited. Read before shipping derivatives." },
      {
        label: "Notices",
        text: "Do not remove licensing, copyright, or protection mechanisms the license forbids removing.",
      },
    ],
    forUsers:
      "Running it yourself is the normal free path. Reselling it as a service is the blocked one. Check which license your exact version uses, because Elastic has changed options over time.",
    forCreators:
      "A model for free self-managed adoption that still stops managed-service freeloading. Be explicit about which license each distribution uses.",
    commonMistake:
      "Assuming Elastic and SSPL are interchangeable. Both limit managed services. SSPL conditions it, Elastic prohibits it.",
    officialUrl: "https://www.elastic.co/licensing/elastic-license",
    aliases: ["Elastic License 2.0", "Elastic-2.0", "ELv2", "Elastic License"],
  },
  {
    id: "busl-1-1",
    name: "Business Source License 1.1",
    sidebarLabel: "BUSL-1.1",
    group: "source-available",
    spdx: "BUSL-1.1",
    osiNote: "Source-available now, open source at the change date",
    summary:
      "BUSL-1.1 changes from project to project, so the Additional Use Grant decides what you may do until the published change date. After that date, the code moves to the named open-source license.",
    verdicts: {
      selfHost: "depends",
      companyUse: "depends",
      osi: "no",
      service: "depends",
      modify: "depends",
      redistribute: "depends",
      copyleft: "delayed",
    },
    conditions: [
      {
        label: "Everything",
        text: "Read the project's Additional Use Grant and change date. Many grants allow self-host use. Some allow internal production use when you are not competing with the licensor. Service is usually restricted when it competes.",
      },
      { label: "Notices", text: "Keep the BSL parameters, change date, and grant text with the code." },
    ],
    forUsers:
      "Never assume one BSL project grants what another does. Home lab use is usually allowed. Company production use needs a read of that specific project's grant.",
    forCreators:
      "Pick BSL for public source now, limited competition for a period, and automatic conversion to open source later. Write the Additional Use Grant in plain language, because self-hosters will judge the project on that paragraph.",
    commonMistake:
      "Reading only the generic BUSL-1.1 text and skipping the Additional Use Grant. The grant is where self-host production rights actually live.",
    officialUrl: "https://mariadb.com/bsl-faq-mariadb/",
    officialLinkLabel: "Official BSL guidance",
    aliases: ["BSL", "BSL 1.1", "BUSL-1.1", "Business Source License"],
  },
  {
    id: "fsl",
    name: "Functional Source License",
    sidebarLabel: "FSL",
    group: "source-available",
    spdx: null,
    osiNote: "Source-available now, open source after the delay",
    summary:
      "FSL allows broad use but temporarily blocks products that compete with the original software. After the delay, the code converts to MIT or Apache-2.0.",
    verdicts: {
      selfHost: "yes",
      companyUse: "careful",
      osi: "no",
      service: "careful",
      modify: "yes",
      redistribute: "careful",
      copyleft: "delayed",
    },
    conditions: [
      { label: "Company", text: "Fine unless you are offering a competing product." },
      {
        label: "Service",
        text: "Allowed for many uses, blocked for competing commercial products during the restriction window.",
      },
      {
        label: "Redistribute",
        text: "Allowed under FSL terms, with the non-compete limit during the restricted period.",
      },
    ],
    forUsers:
      "Running the app for yourself is fine. Building a hosted competitor during the restricted period is the blocked case.",
    forCreators:
      "Self-host freedom and public source with a temporary shield against competing hosted products. Labels like FSL-1.1-MIT tell people which open license arrives after the delay. Make that obvious in the repo.",
    commonMistake: "Calling FSL open source on day one. It is designed as eventually open source.",
    officialUrl: "https://fsl.software/",
    officialLinkLabel: "Official FSL site",
    aliases: ["FSL", "FSL-1.1-MIT", "FSL-1.1-Apache-2.0", "Functional Source License"],
  },
  {
    id: "polyform-shield",
    name: "PolyForm Shield 1.0.0",
    sidebarLabel: "PolyForm Shield",
    group: "source-available",
    spdx: "PolyForm-Shield-1.0.0",
    osiNote: "Source-available, not OSI-approved",
    summary: "Broad use allowed, except using the software to compete with the licensor's products.",
    verdicts: {
      selfHost: "yes",
      companyUse: "careful",
      osi: "no",
      service: "careful",
      modify: "yes",
      redistribute: "careful",
      copyleft: "none",
    },
    conditions: [
      { label: "Company", text: "Fine if your product is not a competitor as the license defines it." },
      { label: "Service", text: "Allowed unless the offering competes with the licensor." },
      { label: "Redistribute", text: "Allowed, excluding competing use." },
    ],
    forUsers: "Normal personal or internal use is fine. Building a competing product needs a careful read.",
    forCreators:
      "Keeps source readable and blocks direct commercial clones without banning all commercial use. Define competition precisely or expect distrust.",
    commonMistake: null,
    officialUrl: "https://polyformproject.org/licenses/shield/1.0.0",
    aliases: ["PolyForm Shield License 1.0.0", "PolyForm-Shield-1.0.0"],
  },
  {
    id: "sustainable-use",
    name: "Sustainable Use License",
    sidebarLabel: "Sustainable Use",
    group: "source-available",
    spdx: "SUL",
    osiNote: "Source-available, not OSI-approved. A family, not one text.",
    summary:
      "Vendor terms that allow free internal self-hosting while limiting your right to offer the software itself to third parties as a service.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "no",
      service: "no",
      modify: "depends",
      redistribute: "depends",
      copyleft: "none",
    },
    conditions: [
      {
        label: "Service",
        text: "Usually no for multi-tenant or customer-facing hosting of the software itself.",
      },
      { label: "Modify", text: "Often fine for internal use. The exact version text decides." },
      { label: "Redistribute", text: "Many versions restrict providing the software to third parties." },
    ],
    forUsers:
      "Treat the label as a family, not a universal text. Open that project's license page before any commercial hosting plan.",
    forCreators:
      "Used by products that want free self-host adoption and paid rights for offering the product to others. Publish a plain-language FAQ next to the legal text.",
    commonMistake: "Assuming every Sustainable Use License matches another vendor's word for word.",
    officialUrl: "https://github.com/n8n-io/n8n/blob/master/LICENSE.md",
    officialLinkLabel: "Example license text",
    aliases: ["Sustainable Use License", "Sustainable Use License 1.0"],
  },
  {
    id: "polyform-noncommercial",
    name: "PolyForm Noncommercial 1.0.0",
    sidebarLabel: "PolyForm NC",
    group: "source-available",
    spdx: "PolyForm-Noncommercial-1.0.0",
    osiNote: "Source-available, not OSI-approved",
    summary:
      "Non-commercial use, modification, and sharing are allowed. Commercial use needs separate permission from the publisher.",
    verdicts: {
      selfHost: "yes",
      companyUse: "no",
      osi: "no",
      service: "no",
      modify: "careful",
      redistribute: "careful",
      copyleft: "none",
    },
    conditions: [
      { label: "Company", text: "No under this license alone. You need another grant." },
      { label: "Service", text: "Not for commercial services." },
      { label: "Modify", text: "Allowed for non-commercial purposes." },
      {
        label: "Redistribute",
        text: "Allowed for non-commercial purposes when you keep the required notices and license terms.",
      },
    ],
    forUsers:
      "A personal home setup is fine. A company deployment is not, unless the publisher grants a commercial license.",
    forCreators:
      "Use it when free personal use is welcome and company use should pay or ask first, accepting that business adoption will shrink.",
    commonMistake:
      "Deploying PolyForm Noncommercial software on company infrastructure because the repository is public.",
    officialUrl: "https://polyformproject.org/licenses/noncommercial/1.0.0",
    aliases: ["PolyForm Noncommercial 1.0.0", "PolyForm-Noncommercial-1.0.0"],
  },
  {
    id: "proprietary-eula",
    name: "Proprietary EULAs and custom commercial licenses",
    sidebarLabel: "Proprietary / EULA",
    group: "source-available",
    spdx: null,
    osiNote: "Not open source",
    summary:
      "Your rights come only from that vendor agreement. There is no general open-source permission set underneath it.",
    verdicts: {
      selfHost: "depends",
      companyUse: "depends",
      osi: "n.a.",
      service: "depends",
      modify: "no",
      redistribute: "no",
      copyleft: "n.a.",
    },
    conditions: [
      {
        label: "Everything",
        text: "Only what the EULA or paid plan explicitly grants. Hosting for others needs a specific hosting or MSP grant.",
      },
      { label: "Notices", text: "Follow seat counts, branding rules, and the agreement." },
    ],
    forUsers:
      "Free to download is not the same as open source. Check personal versus business tiers before the software lands on a work server.",
    forCreators:
      "Fine when the product is commercial-first. Say so plainly in the README and spell out which features sit behind the paid tier.",
    commonMistake: "Assuming a free download is open source.",
    officialUrl: null,
    aliases: [
      "Proprietary EULA",
      "Proprietary",
      "Commercial",
      "Custom",
      "Tdarr EULA",
      "Statamic License",
    ],
  },

  // --- Creative Commons and content licenses ---
  {
    id: "cc-by-4-0",
    name: "Creative Commons Attribution 4.0",
    sidebarLabel: "CC BY 4.0",
    group: "cc-content",
    spdx: "CC-BY-4.0",
    osiNote: "Content license, not a software license",
    summary: "Requires attribution. Built for creative works and data rather than application backends.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "n.a.",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    conditions: [
      { label: "Everything", text: "Allowed with credit when you share the material." },
    ],
    forUsers:
      "Check whether CC BY covers only the docs and assets while the application code sits under MIT, AGPL, or another software license.",
    forCreators: "Use CC BY for docs, diagrams, and media. Prefer a software license for application code.",
    commonMistake:
      "Treating CC BY as a normal app license without checking which part of the project it covers.",
    officialUrl: "https://creativecommons.org/licenses/by/4.0/",
    aliases: ["CC-BY-4.0", "CC BY 4.0", "CC-BY"],
  },
  {
    id: "cc-by-sa-4-0",
    name: "Creative Commons Attribution-ShareAlike 4.0",
    sidebarLabel: "CC BY-SA 4.0",
    group: "cc-content",
    spdx: "CC-BY-SA-4.0",
    osiNote: "Content license, not a software license",
    summary:
      "Attribution plus share-alike. Publicly shared adaptations must use a compatible ShareAlike license.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "n.a.",
      service: "careful",
      modify: "careful",
      redistribute: "careful",
      copyleft: "share-alike",
    },
    conditions: [
      { label: "Modify", text: "Public sharing of adaptations triggers ShareAlike." },
      {
        label: "Service",
        text: "Depends on whether you are distributing adapted content. Running software is not the same as republishing a CC work.",
      },
      {
        label: "Redistribute",
        text: "Shared material needs attribution, and shared adaptations must keep a compatible ShareAlike license.",
      },
    ],
    forUsers: "Mostly relevant to docs, wikis, and media packs rather than Docker backends.",
    forCreators: "Good for shared documentation communities. Keep application code on a software license.",
    commonMistake: null,
    officialUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    aliases: ["CC-BY-SA-4.0", "CC BY-SA 4.0", "CC-BY-SA"],
  },
  {
    id: "cc-by-nc",
    name: "Creative Commons NonCommercial",
    sidebarLabel: "CC BY-NC 4.0",
    group: "cc-content",
    spdx: "CC-BY-NC-4.0",
    osiNote: "Content license, not a software license",
    summary:
      "Free non-commercial use with attribution. Company use and other commercial use need a different permission.",
    verdicts: {
      selfHost: "yes",
      companyUse: "no",
      osi: "n.a.",
      service: "no",
      modify: "careful",
      redistribute: "careful",
      copyleft: "none",
    },
    conditions: [
      { label: "Company", text: "No without another license." },
      { label: "Service", text: "Not for commercial services." },
      { label: "Modify", text: "Adaptations are allowed only for non-commercial purposes." },
      {
        label: "Redistribute",
        text: "Sharing is allowed only for non-commercial purposes and with the required attribution.",
      },
    ],
    forUsers:
      "Hobby use may be fine. Company wikis, marketing sites, and paid products need a separate grant.",
    forCreators:
      "Use it when free personal sharing is welcome and commercial reuse should stop or pay, expecting lower business adoption.",
    commonMistake: "Using NC-licensed material in company material without a separate grant.",
    officialUrl: "https://creativecommons.org/licenses/by-nc/4.0/",
    aliases: ["CC BY-NC 4.0", "CC-BY-NC", "CC BY-NC-SA 4.0", "CC-BY-NC-SA-4.0"],
  },

  // --- Patterns, not licenses ---
  {
    id: "dual-licensing",
    name: "Dual licensing",
    sidebarLabel: "Dual licensing",
    group: "patterns",
    spdx: null,
    osiNote: null,
    summary:
      "Dual licensing gives the same code more than one legal path, often AGPL for the community and a paid license for companies. You follow the option you qualify for.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "depends",
      service: "depends",
      modify: "depends",
      redistribute: "depends",
      copyleft: "depends",
    },
    conditions: [
      {
        label: "Everything",
        text: "The license option you choose, and any eligibility rules in the project documentation, decide service, modification, and redistribution rights.",
      },
    ],
    forUsers:
      "A label like AGPL-3.0/MIT means the project's docs decide which option applies to you. If you only run upstream releases, follow the operator path they document.",
    forCreators:
      "A free AGPL or GPL community edition plus a paid commercial license is the practical model. Explain the split in the README, because dual strings without explanation create confusion.",
    commonMistake:
      "Picking the friendliest short label from a dual string without reading which option applies to you.",
    officialUrl: null,
    aliases: ["AGPL-3.0/MIT", "MIT/AGPL-3.0", "Apache-2.0 or GPL-2.0", "dual"],
  },
  {
    id: "community-enterprise-split",
    name: "Community edition plus enterprise modules",
    sidebarLabel: "Community + enterprise",
    group: "patterns",
    spdx: null,
    osiNote: null,
    summary:
      "The software splits into a free community edition and paid enterprise modules. The core may be open or source-available while features like SSO sit behind a separate commercial license.",
    verdicts: {
      selfHost: "depends",
      companyUse: "depends",
      osi: "depends",
      service: "depends",
      modify: "depends",
      redistribute: "depends",
      copyleft: "mixed",
    },
    conditions: [
      {
        label: "Everything",
        text: "Rights depend on which edition, module, and version you use. Check the license attached to each component.",
      },
    ],
    forUsers:
      "A directory card can say AGPL or MIT and still hide SSO behind a paid module. Check which edition contains the features you actually need.",
    forCreators:
      "Very common for self-host businesses. Keep the free core genuinely useful or people will fork and leave, and publish a clear feature matrix. That matrix is part of the license story.",
    commonMistake: "Assuming every feature in the screenshots is included in the community license.",
    officialUrl: null,
    aliases: [
      "AGPL-3.0 core; enterprise directory separately licensed",
      "MIT Expat core; enterprise features separately licensed",
      "AGPL-3.0 / Commercial License",
    ],
  },
  {
    id: "or-later-and-exceptions",
    name: "or-later, linking exceptions, and mixed trees",
    sidebarLabel: "or-later / mixed trees",
    group: "patterns",
    spdx: null,
    osiNote: null,
    summary:
      "Version suffixes, linking exceptions, and licenses that vary by folder. These change what you may do even when the short label looks familiar.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      osi: "depends",
      service: "depends",
      modify: "depends",
      redistribute: "depends",
      copyleft: "mixed",
    },
    conditions: [
      {
        label: "Everything",
        text: "The exact version suffix, exception text, and license attached to each folder decide service, modification, and redistribution rights.",
      },
    ],
    forUsers:
      "For normal installs, run the release the project ships and you are fine. If you vendor a monorepo into your own product, inventory the subfolder licenses.",
    forCreators:
      "Prefer one clear license for the main app. Say GPL-2.0-only or GPL-2.0-or-later explicitly, because they are not the same thing.",
    commonMistake:
      "Trusting a single SPDX label on a multi-package monorepo without checking the subfolders.",
    officialUrl: null,
    aliases: [
      "GPL-2.0 with linking exceptions",
      "MIT with exceptions",
      "GPL-2.0-or-GPL-3.0",
      "Mixed",
    ],
  },
];

export function licensesInGroup(groupId: LicenseGroupId) {
  return licenses.filter((license) => license.group === groupId);
}

export function findLicenseAnchor(label: string | null | undefined) {
  if (!label) return null;
  const normalized = label.trim().toLowerCase();
  if (!normalized) return null;

  for (const license of licenses) {
    const candidates = [license.name, license.sidebarLabel, license.spdx, ...license.aliases]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());
    if (candidates.includes(normalized)) {
      return license.id;
    }
  }

  const first = normalized.split(/[/;]/)[0]?.trim();
  if (first && first !== normalized) {
    return findLicenseAnchor(first);
  }

  return null;
}

export function findDirectoryLicenseId(
  spdxId: string | null | undefined,
  label: string | null | undefined,
) {
  const id = findLicenseAnchor(spdxId) ?? findLicenseAnchor(label);
  return id && licenses.some((license) => license.id === id && license.group !== "patterns")
    ? id
    : null;
}
