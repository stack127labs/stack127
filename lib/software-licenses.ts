/**
 * Software licenses for self-hosters.
 * Single source of truth for sidebar anchors and page sections.
 * Written for people who run apps and people who publish them.
 * Not legal advice. Prefer official license text when decisions matter.
 */

export type LicenseGroupId =
  | "start-here"
  | "permissive"
  | "weak-copyleft"
  | "strong-copyleft"
  | "source-available"
  | "public-domain-cc"
  | "patterns";

export type LicenseGroup = {
  id: LicenseGroupId;
  title: string;
  sidebarLabel: string;
  /** One line that frames the family before its cards. */
  intro?: string;
};

export type LicenseFacts = {
  /** Whether OSI treats this as open source. Plain language, not a legal verdict. */
  osiOpenSource: string;
  homeSelfHost: string;
  commercialInternal: string;
  modify: string;
  redistribute: string;
  offerAsService: string;
  copyleft: string;
  notices: string;
};

/** One-word answers for the verdict table. "careful" means allowed with conditions worth reading. */
export type Verdict = "yes" | "no" | "careful";

export type LicenseVerdicts = {
  selfHost: Verdict;
  companyUse: Verdict;
  service: Verdict;
  modify: Verdict;
  redistribute: Verdict;
  /** Copyleft class: none, weak, strong, network, share-alike, varies, mixed, or n.a. */
  copyleft: string;
};

export type LicenseEntry = {
  id: string;
  name: string;
  sidebarLabel: string;
  group: LicenseGroupId;
  /** Short SPDX or common id when stable. */
  spdx: string | null;
  summary: string;
  /** One-word answers for the verdict table; details live in facts. */
  verdicts: LicenseVerdicts;
  /** Full detail sentences behind the verdicts. */
  facts: LicenseFacts;
  /** One sentence for people running the app. */
  forUsers: string;
  /** One sentence for people licensing their own app. */
  forCreators: string;
  commonMistake: string | null;
  officialUrl: string;
  /** Strings that may appear in open_projects.license for matching. */
  aliases: string[];
};

export type ConceptEntry = {
  id: string;
  title: string;
  sidebarLabel: string;
  paragraphs: string[];
};

export const licensePage = {
  title: "Software licenses for self-hosters",
  lede:
    "Every app you find on GitHub, Docker Hub, or a directory card ships with a license label: MIT, AGPL, SSPL, Elastic, BSL. That one label decides whether you can run the app at home, put it on a work server, or host it for other people. This page turns the labels you will actually meet into direct answers.",
  notLegalAdvice:
    "This page is a practical guide, not legal advice. If money, customers, or a commercial product are involved, read the project's LICENSE file and get legal help when you need it.",
};

export const licenseGroups: LicenseGroup[] = [
  { id: "start-here", title: "Start here", sidebarLabel: "Start here" },
  {
    id: "permissive",
    title: "Permissive licenses",
    sidebarLabel: "Permissive",
    intro:
      "Run it, change it, sell it, keep your fork private forever. The only real duty is keeping copyright notices when you redistribute.",
  },
  {
    id: "weak-copyleft",
    title: "Weak copyleft licenses",
    sidebarLabel: "Weak copyleft",
    intro:
      "Free to use anywhere. The share-back duty is scoped: changes to the covered files or library must stay open when you ship them, the rest of your product stays yours.",
  },
  {
    id: "strong-copyleft",
    title: "Strong and network copyleft",
    sidebarLabel: "Strong / network",
    intro:
      "The whole program stays free software. GPL triggers when you distribute it; AGPL also triggers when people use your modified version over a network.",
  },
  {
    id: "source-available",
    title: "Source-available and restricted",
    sidebarLabel: "Source-available",
    intro:
      "Code you can read and usually self-host, with business restrictions that keep it outside the open-source definition. The restriction is almost always about selling it as a service.",
  },
  {
    id: "public-domain-cc",
    title: "Public domain and Creative Commons",
    sidebarLabel: "Public domain / CC",
    intro:
      "Public-domain dedications and content licenses. Fine to run; the real question is what part of the project they actually cover.",
  },
  {
    id: "patterns",
    title: "Dual licenses and custom patterns",
    sidebarLabel: "Dual / custom",
    intro:
      "Not single licenses but shapes you will meet: dual licensing, community editions with paid modules, and repos that mix licenses by folder.",
  },
];

export const concepts: ConceptEntry[] = [
  {
    id: "open-source-vs-source-available",
    title: "The copyleft column splits the table in two",
    sidebarLabel: "Open source vs source-available",
    paragraphs: [
      "Look back at that copyleft column and you will notice the table splits in two. Everything from MIT down through AGPL is open source as the Open Source Initiative defines it: anyone can use, study, change, and share the software for any purpose, including commercially. The rows where a no appears under “as a service” are mostly source-available licenses: SSPL, Elastic, BSL, FSL, PolyForm. Their code is public and usually fine to self-host, but a business restriction, almost always about selling the software as a managed service, keeps them outside the open-source definition.",
      "This is also why a public GitHub repo proves nothing by itself. The repo shows you the code; only the LICENSE file tells you which side of that line the project sits on.",
    ],
  },
  {
    id: "how-copyleft-spreads",
    title: "Copyleft: use the code, inherit its rules",
    sidebarLabel: "How copyleft spreads",
    paragraphs: [
      "The other word that decides everything in that table is copyleft. Permissive licenses let your fork stay private forever. Copyleft licenses attach conditions that travel with the code: change it, and under some circumstances you owe people your changes. Which circumstances is exactly the difference between GPL and AGPL, and it is why so many self-host web apps pick AGPL.",
      "The trigger is the part people get wrong. Running an app unmodified, or keeping your changes inside your home or company, triggers nothing. GPL activates when you distribute the program to others. AGPL also activates when people merely use your modified version over a network, which is what a hosted service is.",
    ],
  },
];

const yesHome = "Yes for normal home self-hosting.";
const yesCompany = "Yes for internal company use.";
const yesModify = "Yes. Keep the required notices when you redistribute.";
const permissiveService =
  "Yes. This open-source license does not block hosting the software for other people. Trademarks and branding can still apply.";
const keepNotices =
  "Keep copyright and license notices when you distribute copies. Apache also requires NOTICE handling when a NOTICE file exists.";

export const licenses: LicenseEntry[] = [
  // --- Permissive ---
  {
    id: "mit",
    name: "MIT License",
    sidebarLabel: "MIT",
    group: "permissive",
    spdx: "MIT",
    summary:
      "MIT is a short permissive license. You can run the software, change it, use it commercially, and host it for others. The main rule is that you keep the copyright and license notice when you give the code or a package to someone else.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    facts: {
      osiOpenSource: "Yes (OSI-approved).",
      homeSelfHost: yesHome,
      commercialInternal: yesCompany,
      modify: yesModify,
      redistribute: "Yes, including inside a closed product, as long as notices stay with the distribution.",
      offerAsService: permissiveService,
      copyleft: "None.",
      notices: "Include the MIT copyright and permission notice with distributions.",
    },
    forUsers:
      "For self-hosting, MIT is about as easy as it gets: run the official image, change config, and keep a private fork without sharing it.",
    forCreators:
      "Pick MIT when you want companies and everyone else to reuse your code with almost no conditions, knowing it will not stop a cloud host from selling your app as a service.",
    commonMistake:
      "Assuming MIT means the project has no paid edition. Many apps are MIT for the core code and separately paid for enterprise modules or hosted plans.",
    officialUrl: "https://opensource.org/license/mit",
    aliases: ["MIT", "MIT License", "MIT Expat"],
  },
  {
    id: "apache-2-0",
    name: "Apache License 2.0",
    sidebarLabel: "Apache-2.0",
    group: "permissive",
    spdx: "Apache-2.0",
    summary:
      "Apache-2.0 is a permissive license like MIT, with clearer patent terms and stricter notice rules when you redistribute. You can still run, change, and use the software commercially.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    facts: {
      osiOpenSource: "Yes (OSI-approved).",
      homeSelfHost: yesHome,
      commercialInternal: yesCompany,
      modify: "Yes. Mark modified files as changed when you redistribute them.",
      redistribute: "Yes, including closed products, with Apache notice rules.",
      offerAsService: permissiveService,
      copyleft: "None.",
      notices: keepNotices,
    },
    forUsers:
      "Running Apache-licensed apps feels like MIT; the extra notice rules only matter if you repackage the software and hand that package to others.",
    forCreators:
      "Pick Apache-2.0 for permissive reuse plus an explicit patent grant, and keep the license text, copyright lines, and NOTICE contents in any builds you ship.",
    commonMistake:
      "Treating Apache-2.0 and MIT as identical when shipping a product. For private self-hosting they feel similar. For redistribution, Apache asks for more care with notices.",
    officialUrl: "https://www.apache.org/licenses/LICENSE-2.0",
    aliases: ["Apache-2.0", "Apache 2.0", "Apache License 2.0"],
  },
  {
    id: "bsd-2-clause",
    name: "BSD 2-Clause License",
    sidebarLabel: "BSD-2-Clause",
    group: "permissive",
    spdx: "BSD-2-Clause",
    summary:
      "BSD-2-Clause is a permissive license. You can use and change the software freely as long as you keep the copyright notice and disclaimer when you redistribute it.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    facts: {
      osiOpenSource: "Yes (OSI-approved).",
      homeSelfHost: yesHome,
      commercialInternal: yesCompany,
      modify: yesModify,
      redistribute: "Yes, with the copyright notice and disclaimer.",
      offerAsService: permissiveService,
      copyleft: "None.",
      notices: "Keep the copyright notice and disclaimer in source and binary distributions.",
    },
    forUsers:
      "Behaves like MIT for self-hosting: home labs and internal company installs are normally fine.",
    forCreators:
      "A clear permissive option with simple terms; check the repo really uses the 2-clause text and not another BSD variant.",
    commonMistake:
      "Assuming every BSD label is the same. 2-clause, 3-clause, and older 4-clause texts differ.",
    officialUrl: "https://opensource.org/license/bsd-2-clause",
    aliases: ["BSD-2-Clause", "BSD 2-Clause", "FreeBSD"],
  },
  {
    id: "bsd-3-clause",
    name: "BSD 3-Clause License",
    sidebarLabel: "BSD-3-Clause",
    group: "permissive",
    spdx: "BSD-3-Clause",
    summary:
      "BSD-3-Clause is like BSD-2-Clause, with one extra rule: you may not use the original author's name to promote your product without permission.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    facts: {
      osiOpenSource: "Yes (OSI-approved).",
      homeSelfHost: yesHome,
      commercialInternal: yesCompany,
      modify: yesModify,
      redistribute: "Yes, with notice, disclaimer, and the non-endorsement rule.",
      offerAsService: permissiveService,
      copyleft: "None.",
      notices: "Keep required notices. Do not claim the original authors endorse your product.",
    },
    forUsers:
      "Day-to-day self-hosting freedom is the same as the other permissive licenses.",
    forCreators:
      "Like BSD-2-Clause, plus a rule that nobody may use your name to promote their product without permission.",
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
    summary:
      "ISC is a short permissive license. In practice it works a lot like MIT: use it, change it, and keep the notice when you redistribute.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    facts: {
      osiOpenSource: "Yes (OSI-approved).",
      homeSelfHost: yesHome,
      commercialInternal: yesCompany,
      modify: yesModify,
      redistribute: "Yes, with the copyright and permission notice.",
      offerAsService: permissiveService,
      copyleft: "None.",
      notices: "Keep the copyright and permission notice with distributions.",
    },
    forUsers:
      "No self-host traps here; treat it like MIT for running the software.",
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
    summary:
      "zlib is a permissive license. You can use it commercially, as long as you do not misrepresent where the code came from and you mark altered versions when required.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    facts: {
      osiOpenSource: "Yes (OSI-approved).",
      homeSelfHost: yesHome,
      commercialInternal: yesCompany,
      modify: "Yes. Do not misrepresent the origin. Mark altered versions when required.",
      redistribute: "Yes, including commercial products, under zlib notice rules.",
      offerAsService: permissiveService,
      copyleft: "None.",
      notices: "Do not claim you wrote the original. Keep origin credit as required.",
    },
    forUsers:
      "zlib usually appears as a library under an app rather than as the app's own license; self-hosting is normally fine either way.",
    forCreators:
      "Reasonable for libraries; for a full self-host app, MIT or Apache-2.0 are clearer for contributors and companies.",
    commonMistake: null,
    officialUrl: "https://opensource.org/license/zlib",
    aliases: ["Zlib", "zlib", "Libpng"],
  },

  // --- Weak copyleft ---
  {
    id: "mpl-2-0",
    name: "Mozilla Public License 2.0",
    sidebarLabel: "MPL-2.0",
    group: "weak-copyleft",
    spdx: "MPL-2.0",
    summary:
      "MPL-2.0 is a weak copyleft license. You can combine it with other code, but if you distribute changes to MPL-covered files, those files must stay under MPL and their source must remain available.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "yes",
      modify: "careful",
      redistribute: "careful",
      copyleft: "weak",
    },
    facts: {
      osiOpenSource: "Yes (OSI-approved).",
      homeSelfHost: yesHome,
      commercialInternal: yesCompany,
      modify: "Yes. Share modifications to MPL files if you distribute those files.",
      redistribute: "Yes. MPL files stay under MPL. Other files can use other licenses.",
      offerAsService:
        "Usually fine for hosting. If you distribute modified MPL files, source for those files must stay available under MPL.",
      copyleft: "Weak, file-level.",
      notices: "Keep MPL notices on covered files and offer source for distributed MPL changes.",
    },
    forUsers:
      "Running MPL software privately is easy; source-sharing starts when you distribute modified packages, not when you only run the app for yourself.",
    forCreators:
      "Pick MPL when you want fixes to your files shared back without forcing whole combined products to become MPL; it sits between MIT and GPL.",
    commonMistake:
      "Treating MPL like AGPL. Hosting a service does not automatically force your whole stack open under MPL.",
    officialUrl: "https://www.mozilla.org/en-US/MPL/2.0/",
    aliases: ["MPL-2.0", "MPL 2.0", "Mozilla Public License 2.0"],
  },
  {
    id: "lgpl-2-1",
    name: "GNU Lesser General Public License 2.1",
    sidebarLabel: "LGPL-2.1",
    group: "weak-copyleft",
    spdx: "LGPL-2.1",
    summary:
      "LGPL-2.1 is a weak copyleft license designed mainly for libraries. You can often link it into other software more flexibly than GPL, but changes to the LGPL library itself still need to be shared when you distribute them.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "yes",
      modify: "careful",
      redistribute: "careful",
      copyleft: "weak",
    },
    facts: {
      osiOpenSource: "Yes (OSI-approved).",
      homeSelfHost: yesHome,
      commercialInternal: yesCompany,
      modify: "Yes. Distributed library changes generally stay under LGPL.",
      redistribute:
        "Yes, with source rules for the LGPL library portion and linking details that matter if you ship a product.",
      offerAsService:
        "Hosting is usually fine. Shipping modified binaries is where the source duties show up.",
      copyleft: "Weak, library-oriented.",
      notices: "Provide notices and corresponding source for the LGPL parts you distribute.",
    },
    forUsers:
      "Run it at home or work without drama; if you ship a custom image with modified LGPL libraries, plan to offer that library source.",
    forCreators:
      "Better suited to libraries than full apps when you want some copyleft without GPL pressure on every program that links to you.",
    commonMistake:
      "Reading LGPL as if it were MIT. It is friendlier than GPL for libraries, but it is still copyleft.",
    officialUrl: "https://www.gnu.org/licenses/old-licenses/lgpl-2.1.html",
    aliases: ["LGPL-2.1", "LGPL 2.1", "LGPLv2.1"],
  },
  {
    id: "lgpl-3-0",
    name: "GNU Lesser General Public License 3.0",
    sidebarLabel: "LGPL-3.0",
    group: "weak-copyleft",
    spdx: "LGPL-3.0",
    summary:
      "LGPL-3.0 is the newer weak copyleft library license. It keeps the library-focused share-alike idea from LGPL-2.1 and updates the terms around combining and installing the library.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "yes",
      modify: "careful",
      redistribute: "careful",
      copyleft: "weak",
    },
    facts: {
      osiOpenSource: "Yes (OSI-approved).",
      homeSelfHost: yesHome,
      commercialInternal: yesCompany,
      modify: "Yes. Distributed library changes generally stay under LGPL-3.0.",
      redistribute: "Yes, with LGPL-3.0 source rules for the library portion.",
      offerAsService:
        "Private and company hosting are normally fine. Binary distribution is the trigger for the detailed duties.",
      copyleft: "Weak, library-oriented.",
      notices: "Ship notices and corresponding source for distributed LGPL parts.",
    },
    forUsers:
      "Same practical story as LGPL-2.1 for people who only run apps.",
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
    summary:
      "EPL-2.0 is a weak copyleft license used a lot in the Eclipse and Java tooling world. Source-sharing duties focus on the EPL modules you distribute, not automatically on everything around them.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "yes",
      modify: "careful",
      redistribute: "careful",
      copyleft: "weak",
    },
    facts: {
      osiOpenSource: "Yes (OSI-approved).",
      homeSelfHost: yesHome,
      commercialInternal: yesCompany,
      modify: "Yes. Distributed EPL changes need source under EPL terms.",
      redistribute: "Yes, with EPL source rules for covered modules.",
      offerAsService:
        "Hosting without shipping modified EPL code is usually simple. Modified packages need source compliance.",
      copyleft: "Weak in practice for modules.",
      notices: "Keep EPL notices and provide source for distributed EPL code.",
    },
    forUsers:
      "Fine for self-host use; for operators it feels closer to MPL than to AGPL.",
    forCreators:
      "A natural fit in the Eclipse and Java tooling world; elsewhere MPL or Apache is easier for contributors to understand.",
    commonMistake: null,
    officialUrl: "https://www.eclipse.org/legal/epl-2.0/",
    aliases: ["EPL-2.0", "EPL 2.0", "EPL-1.0", "Eclipse Public License"],
  },
  {
    id: "eupl-1-2",
    name: "European Union Public Licence 1.2",
    sidebarLabel: "EUPL-1.2",
    group: "weak-copyleft",
    spdx: "EUPL-1.2",
    summary:
      "EUPL-1.2 is a European copyleft license. You can use it commercially, but sharing and remote-access rules still apply, so it is not as free-form as MIT.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "careful",
      modify: "careful",
      redistribute: "careful",
      copyleft: "network",
    },
    facts: {
      osiOpenSource: "Yes (OSI-approved).",
      homeSelfHost: yesHome,
      commercialInternal: yesCompany,
      modify: "Yes. Distributed derivatives generally stay under EUPL or a listed compatible license.",
      redistribute: "Yes, with EUPL source and copyleft rules.",
      offerAsService:
        "EUPL treats giving remote access as a form of distribution. If you offer a modified public service, source sharing may apply.",
      copyleft: "Copyleft with remote-use wording.",
      notices: "Keep notices and meet source rules when you distribute or offer covered public access.",
    },
    forUsers:
      "Home and internal installs are fine; public multi-tenant hosting of a modified version needs a careful read, because EUPL treats remote access as a form of distribution.",
    forCreators:
      "Common in EU public-sector projects; for a global self-host audience, AGPL is the more familiar network-copyleft choice.",
    commonMistake:
      "Putting EUPL next to MIT only because both allow commercial use. Commercial use is allowed. Share-alike and remote-use terms still matter.",
    officialUrl: "https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12",
    aliases: ["EUPL-1.2", "EUPL 1.2", "European Union Public Licence"],
  },

  // --- Strong / network copyleft ---
  {
    id: "gpl-2-0",
    name: "GNU General Public License 2.0",
    sidebarLabel: "GPL-2.0",
    group: "strong-copyleft",
    spdx: "GPL-2.0",
    summary:
      "GPL-2.0 is a strong copyleft license. You can run and change the software. If you distribute the program to other people, you must also provide the corresponding source under GPL terms.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "yes",
      modify: "careful",
      redistribute: "careful",
      copyleft: "strong",
    },
    facts: {
      osiOpenSource: "Yes (OSI-approved).",
      homeSelfHost: yesHome,
      commercialInternal: yesCompany,
      modify: "Yes for private use. Shipping modified versions means GPL source terms apply.",
      redistribute: "Yes, but the distributed GPL work stays under GPL-compatible terms with source.",
      offerAsService:
        "Running a server for users is not automatically the same as distributing the program. Shipping images, appliances, or downloads is.",
      copyleft: "Strong, triggered mainly by distribution.",
      notices: "Keep GPL notices and offer corresponding source when you distribute covered works.",
    },
    forUsers:
      "Self-hosting GPL apps is normal; private changes on your own server stay private until you distribute them, which for companies usually means appliances or custom images.",
    forCreators:
      "Pick GPL-2.0 when distributed improvements must stay free software; if your real worry is a hosted competitor that never ships code, AGPL is the network-oriented answer.",
    commonMistake:
      "Thinking GPL bans commercial use. It does not. It requires that people who distribute the program also pass along user freedom and source access.",
    officialUrl: "https://www.gnu.org/licenses/old-licenses/gpl-2.0.html",
    aliases: ["GPL-2.0", "GPL 2.0", "GPLv2", "GPL-2.0-only", "GPL-2.0-or-later"],
  },
  {
    id: "gpl-3-0",
    name: "GNU General Public License 3.0",
    sidebarLabel: "GPL-3.0",
    group: "strong-copyleft",
    spdx: "GPL-3.0",
    summary:
      "GPL-3.0 is the updated strong copyleft license. Like GPL-2.0, you can run and change it freely, and distribution of the program brings source-sharing duties under GPL-3.0 terms.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "yes",
      modify: "careful",
      redistribute: "careful",
      copyleft: "strong",
    },
    facts: {
      osiOpenSource: "Yes (OSI-approved).",
      homeSelfHost: yesHome,
      commercialInternal: yesCompany,
      modify: "Yes for private use. Distributed versions need GPL-3.0 source terms.",
      redistribute: "Yes under GPL-3.0 share-alike rules with corresponding source.",
      offerAsService:
        "Network hosting alone is not the same trigger as AGPL. Distribution of the program still is.",
      copyleft: "Strong, triggered mainly by distribution.",
      notices: "Keep notices and provide corresponding source on distribution.",
    },
    forUsers:
      "If you only run the upstream Docker image, GPL-3.0 rarely changes your day; forking the project and shipping a commercial appliance is where the duties start.",
    forCreators:
      "A solid copyleft default without AGPL's network trigger, though many self-host apps pick AGPL because hosted SaaS clones are the more common risk.",
    commonMistake:
      "Using GPL and AGPL as if they were the same. AGPL adds a network interaction rule that GPL does not express the same way.",
    officialUrl: "https://www.gnu.org/licenses/gpl-3.0.html",
    aliases: ["GPL-3.0", "GPL 3.0", "GPLv3", "GPL-3.0-only", "GPL-3.0-or-later"],
  },
  {
    id: "agpl-3-0",
    name: "GNU Affero General Public License 3.0",
    sidebarLabel: "AGPL-3.0",
    group: "strong-copyleft",
    spdx: "AGPL-3.0",
    summary:
      "AGPL-3.0 is a strong open-source license with a network rule. You can run and change the software. If other people use your modified version over a network, you must offer them the corresponding source under AGPL.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "careful",
      modify: "careful",
      redistribute: "careful",
      copyleft: "network",
    },
    facts: {
      osiOpenSource: "Yes (OSI-approved).",
      homeSelfHost: yesHome,
      commercialInternal: yesCompany,
      modify:
        "Yes. Private changes are fine. Network use of a modified version triggers a source offer to those users.",
      redistribute: "Yes under AGPL share-alike rules.",
      offerAsService:
        "Yes, but modified network services must offer corresponding source. Many companies buy a commercial license instead when they want closed changes.",
      copyleft: "Strong network copyleft.",
      notices:
        "Keep AGPL notices and provide corresponding source as required, including for network use of modified versions.",
    },
    forUsers:
      "Running stock AGPL software for your family or company is exactly how these apps expect to be used; the hard case is offering a modified service to outsiders without sharing your source.",
    forCreators:
      "The common choice for self-host web apps: free for self-hosters, hard to run as a closed hosted clone, and often paired with a paid commercial license for companies that need different terms.",
    commonMistake:
      "Believing AGPL forbids self-hosting or company use. It does not. It protects users of network services from hidden modifications.",
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
    id: "osl-3-0",
    name: "Open Software License 3.0",
    sidebarLabel: "OSL-3.0",
    group: "strong-copyleft",
    spdx: "OSL-3.0",
    summary:
      "OSL-3.0 is a strong copyleft license with network-use language. It is less common than AGPL, but it raises similar questions when you offer software to other people.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "careful",
      modify: "careful",
      redistribute: "careful",
      copyleft: "network",
    },
    facts: {
      osiOpenSource: "Yes (OSI-approved).",
      homeSelfHost: yesHome,
      commercialInternal: yesCompany,
      modify:
        "Yes, with OSL share-alike duties when you distribute or deploy in ways the license treats as distribution.",
      redistribute: "Yes under OSL copyleft terms.",
      offerAsService:
        "If you offer the software to third parties, source sharing may apply. Read the text before building a public service on it.",
      copyleft: "Strong, with network-sensitive terms.",
      notices: "Keep OSL notices and meet source requirements on distribution or external deployment.",
    },
    forUsers:
      "Home and internal use are usually fine; treat public service offerings carefully.",
    forCreators:
      "A valid copyleft option, but prefer AGPL unless you have a specific reason: it is far better known in the self-host world.",
    commonMistake: null,
    officialUrl: "https://opensource.org/license/osl-3-0-php",
    aliases: ["OSL-3.0", "OSL 3.0", "Open Software License 3.0"],
  },

  // --- Source-available / restricted ---
  {
    id: "sspl-1-0",
    name: "Server Side Public License 1.0",
    sidebarLabel: "SSPL-1.0",
    group: "source-available",
    spdx: "SSPL-1.0",
    summary:
      "SSPL-1.0 is a source-available license created by MongoDB. You can often run and change the software yourself, but if you offer it as a service to other people, the license can require you to release a very large part of your service stack under SSPL.",
    verdicts: {
      selfHost: "yes",
      companyUse: "careful",
      service: "no",
      modify: "careful",
      redistribute: "careful",
      copyleft: "network",
    },
    facts: {
      osiOpenSource: "No. Not OSI-approved.",
      homeSelfHost: "Usually yes.",
      commercialInternal:
        "Usually yes when you are not selling a public or customer-facing service product built on it.",
      modify: "Yes under SSPL terms.",
      redistribute: "Yes under SSPL, with hard service-related conditions.",
      offerAsService:
        "Heavily restricted. Offering it as a service can require releasing the whole service stack under SSPL.",
      copyleft: "Source-available service copyleft.",
      notices: "Follow SSPL notices and source rules. Read section 13 before any managed offering.",
    },
    forUsers:
      "Self-hosting for yourself or your company is the intended free path, but public source plus SSPL is source-available, not OSI open source.",
    forCreators:
      "Used to keep code readable and self-host friendly while making managed-service resale require releasing the whole service stack; expect pushback from some distributions and enterprise policies.",
    commonMistake:
      "Seeing public source and calling the project open source. Public source plus SSPL is source-available, not OSI open source.",
    officialUrl: "https://www.mongodb.com/legal/licensing/server-side-public-license",
    aliases: ["SSPL-1.0", "SSPL", "Server Side Public License"],
  },
  {
    id: "elastic-license-2-0",
    name: "Elastic License 2.0",
    sidebarLabel: "Elastic-2.0",
    group: "source-available",
    spdx: "Elastic-2.0",
    summary:
      "Elastic License 2.0 is a source-available license used by Elastic products. Self-managed use is usually allowed. Providing the product to others as a managed service is not.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "no",
      modify: "careful",
      redistribute: "careful",
      copyleft: "none",
    },
    facts: {
      osiOpenSource: "No.",
      homeSelfHost: "Usually yes for self-managed deploys.",
      commercialInternal: "Usually yes for internal self-managed use.",
      modify: "Yes within Elastic License limits.",
      redistribute: "Limited. Read before shipping derivatives.",
      offerAsService:
        "No for providing the software as a hosted or managed service under the license restrictions.",
      copyleft: "Source-available limits.",
      notices: "Do not remove licensing, copyright, or protection mechanisms the license forbids removing.",
    },
    forUsers:
      "Running Elastic software yourself is the normal free path and reselling it as a managed service is the blocked one; check which license your exact version uses, because Elastic has changed options over time.",
    forCreators:
      "A model for free self-managed adoption that still stops managed-service freeloading; be explicit about which license each distribution uses.",
    commonMistake:
      "Assuming Elastic License and SSPL are interchangeable. Both limit managed services, but the texts and product choices differ.",
    officialUrl: "https://www.elastic.co/licensing/elastic-license",
    aliases: ["Elastic License 2.0", "Elastic-2.0", "ELv2", "Elastic License"],
  },
  {
    id: "bsl-1-1",
    name: "Business Source License 1.1",
    sidebarLabel: "BSL 1.1",
    group: "source-available",
    spdx: "BUSL-1.1",
    summary:
      "BSL 1.1 is a source-available license with project-specific parameters. What you may do in production depends on that project's Additional Use Grant. After a published change date, the code converts to a named open-source license.",
    verdicts: {
      selfHost: "careful",
      companyUse: "careful",
      service: "careful",
      modify: "careful",
      redistribute: "careful",
      copyleft: "none",
    },
    facts: {
      osiOpenSource:
        "No until the change date converts it to the open-source license named in the BSL parameters.",
      homeSelfHost:
        "Depends on the Additional Use Grant. Many grants allow self-host use. Read the parameters for that project.",
      commercialInternal:
        "Depends on the grant. Some allow internal production use if you are not competing with the licensor.",
      modify: "Usually yes under BSL terms and the grant.",
      redistribute: "Limited. Follow BSL and the project's grant text.",
      offerAsService:
        "Often restricted when the service competes with the licensor. That is the usual commercial boundary.",
      copyleft: "Source-available with delayed open-source conversion.",
      notices: "Keep the BSL parameters, change date, and grant text with the code.",
    },
    forUsers:
      "Never assume one BSL project grants what another does: the Additional Use Grant and change date decide almost everything, so read that project's parameters before company production use.",
    forCreators:
      "Pick BSL for public source now, limited competition for a period, and automatic conversion to open source later, and write the Additional Use Grant in plain language.",
    commonMistake:
      "Reading only the generic BUSL-1.1 text and ignoring the Additional Use Grant. The grant is where self-host production rights often live.",
    officialUrl: "https://mariadb.com/bsl-faq-mariadb/",
    aliases: ["BSL", "BSL 1.1", "BUSL-1.1", "Business Source License"],
  },
  {
    id: "fsl",
    name: "Functional Source License",
    sidebarLabel: "FSL",
    group: "source-available",
    spdx: null,
    summary:
      "FSL is a source-available license that allows broad use, with a temporary ban on competing commercial use. After a delay period, the code converts to Apache-2.0 or MIT.",
    verdicts: {
      selfHost: "yes",
      companyUse: "careful",
      service: "careful",
      modify: "yes",
      redistribute: "careful",
      copyleft: "none",
    },
    facts: {
      osiOpenSource: "No during the non-compete period. Becomes open source after the delay.",
      homeSelfHost: "Usually yes.",
      commercialInternal: "Usually yes if you are not offering a competing product.",
      modify: "Yes under FSL terms.",
      redistribute: "Yes under FSL terms, with the non-compete limit during the restricted period.",
      offerAsService:
        "Allowed for many uses, but not for competing commercial products during the restriction window.",
      copyleft: "Source-available with delayed open-source conversion.",
      notices: "Keep the FSL text and note which open-source license applies after the delay.",
    },
    forUsers:
      "Running the app for yourself is typically fine; building a hosted competitor during the restricted period is the blocked case.",
    forCreators:
      "Gives self-host freedom and public source with a temporary shield against competing hosted products, converting to MIT or Apache-2.0 after the delay.",
    commonMistake:
      "Calling FSL open source on day one. It is designed as eventually open source, not immediately OSI open source.",
    officialUrl: "https://fsl.software/",
    aliases: ["FSL", "FSL-1.1-MIT", "FSL-1.1-Apache-2.0", "Functional Source License"],
  },
  {
    id: "polyform-noncommercial",
    name: "PolyForm Noncommercial 1.0.0",
    sidebarLabel: "PolyForm NC",
    group: "source-available",
    spdx: "PolyForm-Noncommercial-1.0.0",
    summary:
      "PolyForm Noncommercial allows non-commercial use, modification, and sharing. Commercial use needs a separate permission from the publisher.",
    verdicts: {
      selfHost: "yes",
      companyUse: "no",
      service: "no",
      modify: "careful",
      redistribute: "careful",
      copyleft: "none",
    },
    facts: {
      osiOpenSource: "No.",
      homeSelfHost: "Usually yes for personal non-commercial self-hosting.",
      commercialInternal: "No under this license alone. You need another grant.",
      modify: "Yes for non-commercial purposes.",
      redistribute: "Yes for non-commercial purposes under the license terms.",
      offerAsService: "Not for commercial services.",
      copyleft: "Restricted source-available, non-commercial.",
      notices: "Keep license notices and respect the non-commercial boundary.",
    },
    forUsers:
      "A personal home setup is usually allowed; a company deployment is not, unless the publisher grants a commercial license.",
    forCreators:
      "Use it when free personal use is welcome and company use should pay or ask first, accepting that business adoption will shrink.",
    commonMistake:
      "Deploying PolyForm Noncommercial software on company infrastructure only because the repository is public.",
    officialUrl: "https://polyformproject.org/licenses/noncommercial/1.0.0/",
    aliases: ["PolyForm Noncommercial 1.0.0", "PolyForm-Noncommercial-1.0.0"],
  },
  {
    id: "polyform-shield",
    name: "PolyForm Shield 1.0.0",
    sidebarLabel: "PolyForm Shield",
    group: "source-available",
    spdx: "PolyForm-Shield-1.0.0",
    summary:
      "PolyForm Shield allows broad use of the software, except for using it to compete with the licensor's products.",
    verdicts: {
      selfHost: "yes",
      companyUse: "careful",
      service: "careful",
      modify: "yes",
      redistribute: "careful",
      copyleft: "none",
    },
    facts: {
      osiOpenSource: "No.",
      homeSelfHost: "Usually yes.",
      commercialInternal: "Usually yes if your product is not a competitor under the license definition.",
      modify: "Yes under Shield terms.",
      redistribute: "Yes under Shield terms, excluding competing use.",
      offerAsService:
        "Allowed unless the offering competes with the licensor the way the license defines.",
      copyleft: "Source-available non-compete style limit.",
      notices: "Keep the license text and respect the competition boundary.",
    },
    forUsers:
      "Self-hosting for normal personal or internal use is usually fine; building a competing product needs a careful read.",
    forCreators:
      "Keeps source readable and blocks direct commercial clones without banning all commercial use; define competition precisely or expect distrust.",
    commonMistake: null,
    officialUrl: "https://polyformproject.org/licenses/shield/1.0.0/",
    aliases: ["PolyForm Shield License 1.0.0", "PolyForm-Shield-1.0.0"],
  },
  {
    id: "sustainable-use",
    name: "Sustainable Use License",
    sidebarLabel: "Sustainable Use",
    group: "source-available",
    spdx: null,
    summary:
      "Sustainable Use License is a family of vendor source-available terms. Many versions allow free internal self-hosting, while limiting your right to offer the software itself to third parties as a service.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "no",
      modify: "careful",
      redistribute: "careful",
      copyleft: "none",
    },
    facts: {
      osiOpenSource: "No.",
      homeSelfHost: "Usually yes.",
      commercialInternal: "Usually yes for internal production use.",
      modify: "Often yes for internal use. Check the exact version text.",
      redistribute: "Limited. Many versions restrict providing the software to third parties.",
      offerAsService:
        "Usually no for multi-tenant or customer-facing hosting of the software itself.",
      copyleft: "Source-available internal-use style.",
      notices: "Follow the publisher's license file and any commercial upgrade path.",
    },
    forUsers:
      "Treat the label as a family, not one universal text: open that project's license page before any commercial hosting plan.",
    forCreators:
      "Used by products that want free self-host adoption and paid rights for offering the product to others; publish a plain-language FAQ next to the legal text.",
    commonMistake:
      "Assuming every Sustainable Use License matches another vendor word for word.",
    officialUrl: "https://github.com/n8n-io/n8n/blob/master/LICENSE.md",
    aliases: ["Sustainable Use License", "Sustainable Use License 1.0"],
  },
  {
    id: "proprietary-eula",
    name: "Proprietary EULAs and custom commercial licenses",
    sidebarLabel: "Proprietary / EULA",
    group: "source-available",
    spdx: null,
    summary:
      "A proprietary EULA or custom commercial license means your rights come only from that vendor agreement. There is no general open-source permission set underneath it.",
    verdicts: {
      selfHost: "careful",
      companyUse: "careful",
      service: "no",
      modify: "no",
      redistribute: "no",
      copyleft: "n.a.",
    },
    facts: {
      osiOpenSource: "No.",
      homeSelfHost: "Only if the EULA says so.",
      commercialInternal: "Only if the EULA or paid plan says so.",
      modify: "Only if explicitly allowed.",
      redistribute: "Usually no.",
      offerAsService: "Only with a hosting or MSP grant.",
      copyleft: "Proprietary.",
      notices: "Follow seat counts, branding rules, and the vendor agreement.",
    },
    forUsers:
      "Free to download is not the same as open source: check personal versus business tiers before the software lands on a work server.",
    forCreators:
      "Fine when the product is commercial-first; say so plainly in the README and spell out which features sit behind the paid tier.",
    commonMistake: "Assuming a free download is open source.",
    officialUrl: "https://spdx.org/licenses/",
    aliases: [
      "Proprietary EULA",
      "Proprietary",
      "Commercial",
      "Custom",
      "Tdarr EULA",
      "Statamic License",
    ],
  },

  // --- Public domain / CC ---
  {
    id: "unlicense",
    name: "The Unlicense",
    sidebarLabel: "Unlicense",
    group: "public-domain-cc",
    spdx: "Unlicense",
    summary:
      "The Unlicense is a public-domain style dedication. Where it works as intended, you can use, change, and share the software with almost no conditions.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    facts: {
      osiOpenSource: "Yes, as a public-domain-equivalent license.",
      homeSelfHost: yesHome,
      commercialInternal: yesCompany,
      modify: "Yes.",
      redistribute: "Yes.",
      offerAsService: "Yes.",
      copyleft: "None.",
      notices: "None required, though keeping provenance is still smart.",
    },
    forUsers:
      "There is little to worry about for running the software.",
    forCreators:
      "Maximum reuse with almost no protection; many creators prefer MIT because company legal teams understand it better.",
    commonMistake: null,
    officialUrl: "https://unlicense.org/",
    aliases: ["Unlicense"],
  },
  {
    id: "cc0-1-0",
    name: "CC0 1.0 Universal",
    sidebarLabel: "CC0-1.0",
    group: "public-domain-cc",
    spdx: "CC0-1.0",
    summary:
      "CC0 is a Creative Commons public-domain dedication. It is common for data and documentation, and sometimes used to waive copyright on code as far as the law allows.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    facts: {
      osiOpenSource:
        "Widely treated as public-domain dedication. For software, MIT or Apache are often clearer on patents.",
      homeSelfHost: yesHome,
      commercialInternal: yesCompany,
      modify: "Yes.",
      redistribute: "Yes.",
      offerAsService: "Yes.",
      copyleft: "None.",
      notices: "No attribution required by CC0, though credit is still polite.",
    },
    forUsers:
      "Fine for use, but remember CC0 clears copyright, not trademarks.",
    forCreators:
      "Great for datasets, configs, and docs; for application source, MIT or Apache-2.0 create fewer patent surprises.",
    commonMistake: null,
    officialUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    aliases: ["CC0-1.0", "CC0", "CC0 1.0"],
  },
  {
    id: "wtfpl",
    name: "WTFPL",
    sidebarLabel: "WTFPL",
    group: "public-domain-cc",
    spdx: "WTFPL",
    summary:
      "WTFPL is an informal do-what-you-want license. Practically it is very free, but some companies reject the text as unclear for policy purposes.",
    verdicts: {
      selfHost: "yes",
      companyUse: "careful",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    facts: {
      osiOpenSource: "Not a license corporate policy teams rely on.",
      homeSelfHost: yesHome,
      commercialInternal: "Practically yes, though legal teams may reject it.",
      modify: "Yes.",
      redistribute: "Yes.",
      offerAsService: "Yes under the license text.",
      copyleft: "None.",
      notices: "Almost none.",
    },
    forUsers:
      "Fine for small utilities in a home lab, though company legal teams may reject the text.",
    forCreators:
      "If you want permissive terms people can trust, use MIT instead.",
    commonMistake: null,
    officialUrl: "http://www.wtfpl.net/about/",
    aliases: ["WTFPL"],
  },
  {
    id: "cc-by-4-0",
    name: "Creative Commons Attribution 4.0",
    sidebarLabel: "CC BY 4.0",
    group: "public-domain-cc",
    spdx: "CC-BY-4.0",
    summary:
      "CC BY 4.0 is a content license that requires attribution. It is built for creative works and data more than for application backends.",
    verdicts: {
      selfHost: "careful",
      companyUse: "yes",
      service: "yes",
      modify: "yes",
      redistribute: "yes",
      copyleft: "none",
    },
    facts: {
      osiOpenSource: "Not designed as a software OSI license.",
      homeSelfHost:
        "Private use of covered material is fine. Confirm whether the project meant software, docs, or both.",
      commercialInternal: "Yes if attribution is handled when you share the material.",
      modify: "Yes, with attribution.",
      redistribute: "Yes, with attribution.",
      offerAsService:
        "Usually fine for using the material, with credit rules if you publicly share adapted content.",
      copyleft: "None. Attribution only.",
      notices: "Give the required credit when you share the material.",
    },
    forUsers:
      "Check whether CC BY covers only the docs and assets while the application code sits under a software license.",
    forCreators:
      "Use CC BY for docs, diagrams, and media; prefer a software license for application code.",
    commonMistake:
      "Treating CC BY as a normal app license without checking which part of the project it covers.",
    officialUrl: "https://creativecommons.org/licenses/by/4.0/",
    aliases: ["CC-BY-4.0", "CC BY 4.0", "CC-BY"],
  },
  {
    id: "cc-by-sa-4-0",
    name: "Creative Commons Attribution-ShareAlike 4.0",
    sidebarLabel: "CC BY-SA 4.0",
    group: "public-domain-cc",
    spdx: "CC-BY-SA-4.0",
    summary:
      "CC BY-SA 4.0 is a content license with attribution and share-alike. If you publicly share adapted material, that adaptation must use a compatible ShareAlike license.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "careful",
      modify: "careful",
      redistribute: "careful",
      copyleft: "share-alike",
    },
    facts: {
      osiOpenSource: "Not a standard software OSI license.",
      homeSelfHost: "Private use of covered content is fine.",
      commercialInternal: "Yes for use, with share-alike if you distribute adapted material.",
      modify: "Yes. Public sharing of adaptations triggers ShareAlike.",
      redistribute: "Yes under CC BY-SA terms.",
      offerAsService:
        "Depends on whether you are distributing adapted content. Running software is not the same as republishing a CC work.",
      copyleft: "ShareAlike for the covered content.",
      notices: "Attribution plus compatible ShareAlike licensing on adapted public releases.",
    },
    forUsers:
      "You will mostly meet this on docs, wikis, and media packs around self-hosting, not on the app backends themselves.",
    forCreators:
      "Good for shared documentation communities; keep application code on a software license.",
    commonMistake: null,
    officialUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    aliases: ["CC-BY-SA-4.0", "CC BY-SA 4.0", "CC-BY-SA"],
  },
  {
    id: "cc-by-nc",
    name: "Creative Commons NonCommercial licenses",
    sidebarLabel: "CC BY-NC",
    group: "public-domain-cc",
    spdx: "CC-BY-NC-4.0",
    summary:
      "CC NonCommercial licenses allow free non-commercial use and require attribution. Company use and other commercial use need a different permission.",
    verdicts: {
      selfHost: "yes",
      companyUse: "no",
      service: "no",
      modify: "careful",
      redistribute: "careful",
      copyleft: "none",
    },
    facts: {
      osiOpenSource: "No.",
      homeSelfHost: "Usually fine for pure personal non-commercial use of covered material.",
      commercialInternal: "No for company use without another license.",
      modify: "Yes for non-commercial purposes, with attribution and any ShareAlike rules.",
      redistribute: "Only non-commercially under the CC NC terms.",
      offerAsService: "Not for commercial services.",
      copyleft: "None or ShareAlike, plus NonCommercial.",
      notices: "Attribution, NonCommercial boundary, and ShareAlike if present.",
    },
    forUsers:
      "Hobby use may be fine, but company wikis, marketing sites, and paid products need a separate grant.",
    forCreators:
      "Use it when free personal sharing is welcome and commercial reuse should stop or pay, expecting lower business adoption.",
    commonMistake:
      "Using NC-licensed material in company material without a separate grant.",
    officialUrl: "https://creativecommons.org/licenses/by-nc/4.0/",
    aliases: ["CC BY-NC 4.0", "CC-BY-NC", "CC BY-NC-SA 4.0", "CC-BY-NC-SA-4.0"],
  },

  // --- Patterns ---
  {
    id: "dual-licensing",
    name: "Dual licensing",
    sidebarLabel: "Dual licensing",
    group: "patterns",
    spdx: null,
    summary:
      "Dual licensing means the same code is offered under two or more licenses. You follow one path, or different people are allowed to choose different paths.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "careful",
      modify: "careful",
      redistribute: "careful",
      copyleft: "varies",
    },
    facts: {
      osiOpenSource: "Depends on which license you actually use.",
      homeSelfHost: "Usually yes under at least one offered license.",
      commercialInternal:
        "Usually yes. Companies often buy the commercial path to avoid copyleft duties.",
      modify: "Depends on the chosen license.",
      redistribute: "Depends on the chosen license.",
      offerAsService: "Depends on the chosen license. AGPL plus commercial is a common pair.",
      copyleft: "Depends on the chosen license.",
      notices: "Say which license you are using when you redistribute.",
    },
    forUsers:
      "A label like AGPL-3.0/MIT means the project's docs decide which option applies to you; if you only run upstream releases, follow the operator path they document.",
    forCreators:
      "A free AGPL or GPL community edition plus a paid commercial license is the practical model; explain the split in the README, because dual strings without explanation create confusion.",
    commonMistake:
      "Picking the friendliest short label from a dual string without reading which option applies.",
    officialUrl: "https://choosealicense.com/appendix/",
    aliases: ["AGPL-3.0/MIT", "MIT/AGPL-3.0", "Apache-2.0 or GPL-2.0", "dual"],
  },
  {
    id: "community-enterprise-split",
    name: "Community edition plus enterprise modules",
    sidebarLabel: "Community / enterprise split",
    group: "patterns",
    spdx: null,
    summary:
      "Many self-host products split the software into a community edition and paid enterprise modules. The core may be open or source-available, while features like SSO or support packs use a separate commercial license.",
    verdicts: {
      selfHost: "yes",
      companyUse: "careful",
      service: "careful",
      modify: "careful",
      redistribute: "no",
      copyleft: "mixed",
    },
    facts: {
      osiOpenSource: "Only for the open parts. Enterprise modules are usually proprietary.",
      homeSelfHost: "Community edition usually yes. Enterprise features only with a license.",
      commercialInternal:
        "Community under its own terms. Enterprise features need paid rights.",
      modify: "Follow the core license for core code. Enterprise code is usually closed or restricted.",
      redistribute: "Do not redistribute enterprise packages unless the contract says so.",
      offerAsService:
        "Core may allow self-host service use. Enterprise features and cloud rights are separate.",
      copyleft: "Mixed.",
      notices: "Keep community license notices and commercial agreement limits.",
    },
    forUsers:
      "A directory card can say AGPL or MIT and still hide SSO behind a paid module, so check which edition contains the features you need.",
    forCreators:
      "Very common for self-host businesses: keep the free core genuinely useful and publish a clear feature matrix, because that matrix is part of the license story.",
    commonMistake:
      "Assuming every feature in screenshots is included in the community license.",
    officialUrl: "https://opensource.org/osd",
    aliases: [
      "AGPL-3.0 core; enterprise directory separately licensed",
      "MIT Expat core; enterprise features separately licensed",
      "AGPL-3.0 / Commercial License",
    ],
  },
  {
    id: "or-later-and-exceptions",
    name: "or-later, linking exceptions, and mixed trees",
    sidebarLabel: "or-later / exceptions",
    group: "patterns",
    spdx: null,
    summary:
      "Some projects use version suffixes, linking exceptions, or mixed licenses by folder. Those details change what you may do, even when the short label looks familiar.",
    verdicts: {
      selfHost: "yes",
      companyUse: "yes",
      service: "careful",
      modify: "careful",
      redistribute: "careful",
      copyleft: "mixed",
    },
    facts: {
      osiOpenSource: "Depends on each component.",
      homeSelfHost: "Usually still fine for running upstream releases.",
      commercialInternal: "Usually fine, but product builders must map each component.",
      modify: "Follow each file or package license.",
      redistribute: "The strictest relevant duty wins for the combined work you ship.",
      offerAsService:
        "Map AGPL, SSPL, and commercial modules carefully before multi-tenant hosting.",
      copyleft: "Mixed or exception-limited.",
      notices: "Preserve each license's notices. Do not drop exception texts.",
    },
    forUsers:
      "For normal installs, run the release the project ships and you are usually fine; if you vendor a monorepo into your own product, inventory the subfolder licenses.",
    forCreators:
      "Prefer one clear license for the main app, and say GPL-2.0-only or GPL-2.0-or-later explicitly, because they are not the same.",
    commonMistake:
      "Trusting a single SPDX label on a multi-package monorepo without checking subfolders.",
    officialUrl: "https://spdx.org/licenses/",
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

export function allSidebarItems() {
  return [
    ...concepts.map((concept) => ({
      id: concept.id,
      label: concept.sidebarLabel,
      kind: "concept" as const,
    })),
    ...licenses.map((license) => ({
      id: license.id,
      label: license.sidebarLabel,
      kind: "license" as const,
      group: license.group,
    })),
  ];
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
