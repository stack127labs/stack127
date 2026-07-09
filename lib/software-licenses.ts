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

export type LicenseEntry = {
  id: string;
  name: string;
  sidebarLabel: string;
  group: LicenseGroupId;
  /** Short SPDX or common id when stable. */
  spdx: string | null;
  summary: string;
  facts: LicenseFacts;
  /** What this license means if you run the app. */
  forUsers: string[];
  /** What this license means if you publish an app under it. */
  forCreators: string[];
  commonMistake: string | null;
  officialUrl: string;
  /** Strings that may appear in self_host_apps.license for matching. */
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
    "Self-host apps usually show a short license label such as MIT, AGPL, SSPL, or Elastic. That label tells you what you are allowed to do with the software. It also tells app authors what rights they are giving other people.",
  notLegalAdvice:
    "This page is a practical guide, not legal advice. If money, customers, or a commercial product are involved, read the project's LICENSE file and get legal help when you need it.",
};

export const licenseGroups: LicenseGroup[] = [
  { id: "start-here", title: "Start here", sidebarLabel: "Start here" },
  { id: "permissive", title: "Permissive licenses", sidebarLabel: "Permissive" },
  {
    id: "weak-copyleft",
    title: "Weak copyleft licenses",
    sidebarLabel: "Weak copyleft",
  },
  {
    id: "strong-copyleft",
    title: "Strong and network copyleft",
    sidebarLabel: "Strong / network",
  },
  {
    id: "source-available",
    title: "Source-available and restricted",
    sidebarLabel: "Source-available",
  },
  {
    id: "public-domain-cc",
    title: "Public domain and Creative Commons",
    sidebarLabel: "Public domain / CC",
  },
  {
    id: "patterns",
    title: "Dual licenses and custom patterns",
    sidebarLabel: "Dual / custom",
  },
];

export const concepts: ConceptEntry[] = [
  {
    id: "who-this-is-for",
    title: "Who this page is for",
    sidebarLabel: "Who this is for",
    paragraphs: [
      "If you install self-host apps, this page helps you read the license on an app card. The main questions are: can I run this at home, can my company run it, can I change the code, and can I host it for other people?",
      "Most home setups only need the first answer. The later questions matter when you modify an app, give it to customers, or sell hosting based on it.",
      "If you build and publish a self-host app, this page helps you compare licenses before you pick one. Some licenses make it easy for anyone to reuse your code. Some require people to share their changes. Some let people read and self-host the code, but block certain commercial uses.",
      "A free download is not the same thing as an open-source license. Open-source software can still be sold as a service. A free binary can still ban company use. Trust the LICENSE file in the project, not only the marketing page.",
    ],
  },
  {
    id: "open-source-vs-source-available",
    title: "Open source vs source-available",
    sidebarLabel: "Open source vs source-available",
    paragraphs: [
      "Open source, as defined by the Open Source Initiative (OSI), means people can use, study, change, and share the software for any purpose, including commercial use, under a license that meets that definition. MIT, Apache-2.0, GPL, and AGPL are open source in this sense.",
      "Source-available means the code is public and often free to run, but the license adds business limits. Common limits include: no offering it as a managed service, no competing product, non-commercial use only, or production rights that later turn into an open-source license. SSPL, Elastic License, BSL, FSL, and PolyForm Noncommercial are in this group.",
      "A public GitHub repo does not automatically mean open source. If the license is not OSI-approved, treat the project as software you can often self-host, with extra rules you still need to follow.",
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
    forUsers: [
      "For home or company self-hosting, MIT is one of the easiest licenses to live with. You can run the official image, change config, and keep a private fork without sharing it.",
      "If you only run the app and never ship a package to other people, day-to-day compliance is usually just using the software as published.",
    ],
    forCreators: [
      "Choose MIT if you want other people, including companies, to reuse your code with very few conditions. It is widely understood and rarely blocks adoption.",
      "MIT will not stop a cloud company from hosting your app as a paid service. If that is a real concern, look at AGPL, SSPL, BSL, FSL, or a paid commercial license instead.",
    ],
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
    forUsers: [
      "Running Apache-licensed apps at home or work is straightforward. For operators, the practical freedom is very close to MIT.",
      "The extra notice rules matter mainly if you repackage the software and give that package to other people.",
    ],
    forCreators: [
      "Choose Apache-2.0 if you want permissive reuse plus an explicit patent grant. Many infrastructure and foundation projects use it for that reason.",
      "If you ship builds, keep the license text, copyright statements, and any NOTICE file contents. That is the main extra work compared with MIT.",
    ],
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
    forUsers: [
      "For self-hosting, BSD-2-Clause behaves like MIT. Home labs and internal company installs are normally fine.",
    ],
    forCreators: [
      "A clear permissive option when you want simple terms and wide reuse. Check that the repo really uses the 2-clause text, not another BSD variant.",
    ],
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
    forUsers: [
      "Day-to-day self-hosting freedom is the same as other permissive licenses.",
    ],
    forCreators: [
      "Useful if you want permissive reuse but still want to block people from implying you endorse their product.",
    ],
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
    forUsers: [
      "There are no special self-host traps here. Treat it like MIT for running the software.",
    ],
    forCreators: [
      "Fine when you want a short permissive text. MIT and Apache-2.0 are more familiar to many company legal teams.",
    ],
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
    forUsers: [
      "zlib often appears as a library under an app rather than as the app's top-level license. Either way, self-hosting is normally fine.",
    ],
    forCreators: [
      "Reasonable for libraries. For a full self-host app, MIT or Apache-2.0 are usually clearer for contributors and companies.",
    ],
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
    forUsers: [
      "Running MPL software privately is usually easy. Source-sharing mainly starts when you distribute modified packages, not when you only run the app for yourself.",
    ],
    forCreators: [
      "Choose MPL if you want people to share fixes to your own files, without forcing their entire product to become MPL.",
      "It sits between MIT and GPL: more share-alike than MIT, less all-or-nothing than GPL for combined products.",
    ],
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
    forUsers: [
      "You can run LGPL software at home or work without special drama.",
      "If you ship a custom image that includes modified LGPL libraries, plan to offer that library source.",
    ],
    forCreators: [
      "Better suited to libraries than to full self-host apps when you want some copyleft without full GPL pressure on every program that links to you.",
      "For a complete self-host application, AGPL or GPL usually send a clearer signal.",
    ],
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
    forUsers: [
      "Same practical story as LGPL-2.1 for people who only run apps.",
    ],
    forCreators: [
      "Use it for libraries when you want modern GPL-3-era terms without forcing every combined work into full GPL.",
    ],
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
    forUsers: [
      "Fine for self-host use. For operators it feels closer to MPL than to AGPL.",
    ],
    forCreators: [
      "A natural fit if you are in the Eclipse or Java tooling ecosystem. Outside that world, MPL or Apache may be easier for contributors to understand.",
    ],
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
    forUsers: [
      "Home and internal installs are fine. Public multi-tenant hosting of a modified version needs a careful read of the license text.",
    ],
    forCreators: [
      "Common in EU public-sector and European open projects. If most of your users are global self-hosters, AGPL is often the more familiar network-copyleft option.",
    ],
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
    forUsers: [
      "Self-hosting GPL apps is normal and expected. Private changes on your own server stay private until you distribute them.",
      "Companies hit GPL more often when they ship appliances or custom images, not when they only run the app inside the company.",
    ],
    forCreators: [
      "Choose GPL when you want improvements that get distributed to remain free software under the same kind of terms.",
      "If your real concern is a hosted competitor that never ships code to users, AGPL is the stronger network-oriented choice.",
    ],
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
    forUsers: [
      "If you only run an upstream Docker image, GPL-3.0 rarely changes your day-to-day work.",
      "Forking the project and shipping a commercial appliance is where the duties become important.",
    ],
    forCreators: [
      "A solid default when you want copyleft without AGPL's network trigger.",
      "Many self-host apps choose AGPL instead because hosted SaaS clones are a more common risk than boxed appliances.",
    ],
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
    forUsers: [
      "Running stock AGPL software for your family or company is normal. That is how most self-host AGPL apps expect to be used.",
      "The hard case is changing the code and offering that modified service to outsiders without sharing the source.",
    ],
    forCreators: [
      "A common choice for self-host web apps such as notes tools, media apps, admin panels, and collaboration software.",
      "It keeps the project free for self-hosters while making it harder for someone to run a closed hosted clone of your modified code. Many teams also sell a separate commercial license for companies that need different terms.",
    ],
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
    forUsers: [
      "Home and internal use are usually fine. Treat public service offerings carefully.",
    ],
    forCreators: [
      "A valid copyleft option, but AGPL is better known in the self-host world. Prefer AGPL unless you have a specific reason to use OSL.",
    ],
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
    forUsers: [
      "Self-hosting for yourself or your company is usually the intended free path.",
      "Do not call the project open source just because the source is on GitHub. SSPL is not OSI-approved open source.",
    ],
    forCreators: [
      "Used when you want the code readable and self-host friendly, while making it hard for cloud providers to turn your software into their product without sharing a lot more source.",
      "Expect pushback from some Linux distributions and enterprise open-source policies. AGPL is the OSI-approved alternative with a different edge.",
    ],
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
    forUsers: [
      "Running Elastic software yourself is the normal free path. Reselling Elastic-as-a-service is the blocked path.",
      "Always check which license your exact version and distribution use, because Elastic has changed options over time.",
    ],
    forCreators: [
      "A model if you want free self-managed adoption and still want to stop managed-service freeloading of your product.",
      "Some projects later add AGPL or other options. Be explicit about which license each distribution uses.",
    ],
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
    forUsers: [
      "Never assume one BSL project has the same rights as another. The Additional Use Grant and change date decide almost everything.",
      "Home lab use is often allowed. Company production use needs a careful read of that specific project's grant.",
    ],
    forCreators: [
      "Choose BSL when you want the source public now, limited competition for a period, and a future conversion to open source.",
      "Write the Additional Use Grant in plain language. Self-hosters will judge the project on that paragraph.",
    ],
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
    forUsers: [
      "Running the app for yourself is typically fine. Building a hosted competitor during the restricted period is the blocked case.",
    ],
    forCreators: [
      "Useful when you want self-host freedom and public source, with a temporary shield against competing hosted products.",
      "Labels like FSL-1.1-MIT tell people which open license arrives after the delay. Make that obvious in the repository.",
    ],
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
    forUsers: [
      "A personal home setup is usually allowed. A company deployment is not, unless the publisher sells or grants a commercial license.",
    ],
    forCreators: [
      "Use this when free personal use is welcome and any company use should pay or ask first.",
      "It will limit business adoption. That can be intentional.",
    ],
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
    forUsers: [
      "Self-hosting for normal personal or internal use is usually fine. Building a competing product needs a careful read.",
    ],
    forCreators: [
      "A way to keep source readable and block direct commercial clones without banning all commercial use.",
      "Define competition carefully. Fuzzy boundaries create support load and distrust.",
    ],
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
    forUsers: [
      "Treat the label as a family, not one universal text. Open that project's license page before any commercial hosting plan.",
    ],
    forCreators: [
      "Used by products that want free self-host adoption and paid rights for offering the product to others.",
      "If you use this pattern, publish a short plain-language FAQ next to the legal text. Self-hosters will look for it.",
    ],
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
    forUsers: [
      "Free to download is not the same as open source. Check personal versus business tiers before you put the software on a work server.",
    ],
    forCreators: [
      "Fine when the product is commercial-first. Be honest in the README so directory users are not surprised.",
      "If you also offer a free self-host community edition, say which features sit behind the paid EULA.",
    ],
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
    forUsers: [
      "There is little to worry about for running the software.",
    ],
    forCreators: [
      "Maximum reuse, almost no protection. Many creators prefer MIT because company legal teams understand it better.",
    ],
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
    forUsers: [
      "Fine for use. Remember CC0 addresses copyright. It does not clear trademarks.",
    ],
    forCreators: [
      "Great for datasets, configs, and docs. For application source, MIT or Apache-2.0 usually create fewer surprises.",
    ],
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
    forUsers: [
      "Fine for small utilities in a home lab.",
    ],
    forCreators: [
      "If you want permissive terms people can trust, use MIT instead.",
    ],
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
    forUsers: [
      "Check whether CC BY covers only docs and assets, while the application code sits under MIT, AGPL, or another software license.",
    ],
    forCreators: [
      "Use CC BY for docs, diagrams, and media. Prefer a software license for application code.",
    ],
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
    forUsers: [
      "You will mostly meet this on docs, wikis, diagrams, and media packs around self-hosting, not on Docker app backends.",
    ],
    forCreators: [
      "Good for shared documentation communities. Keep application code on a software license.",
    ],
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
    forUsers: [
      "Hobby use may be fine. Company wikis, marketing sites, and paid products need a separate grant.",
    ],
    forCreators: [
      "Use when free personal sharing is welcome and commercial reuse should stop or pay. Expect lower business adoption.",
    ],
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
    forUsers: [
      "Labels like AGPL-3.0/MIT mean you need the project's docs to know which option applies to your use.",
      "If you only run upstream releases, follow the operator path the project documents.",
    ],
    forCreators: [
      "A practical model is a free AGPL or GPL community edition, plus a paid commercial license for closed modifications or SaaS vendors.",
      "Be explicit in the README. Dual strings without explanation create confusion.",
    ],
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
    forUsers: [
      "When you compare apps, check which features you need and which edition contains them.",
      "A directory card can say AGPL or MIT and still hide SSO behind a paid module.",
    ],
    forCreators: [
      "Very common for self-host businesses. Keep the free core genuinely useful or people will fork and leave.",
      "Publish a clear feature matrix. That matrix is part of the license story for users.",
    ],
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
    forUsers: [
      "For normal self-host installs, run the release the project ships and you are usually fine.",
      "If you vendor a monorepo into your own product, inventory the subfolder licenses.",
    ],
    forCreators: [
      "Prefer one clear license for the main app, plus short notes for SDKs or docs if they differ.",
      "GPL-2.0-only is not the same as GPL-2.0-or-later. Say which one you mean.",
    ],
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
