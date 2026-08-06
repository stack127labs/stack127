#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import ts from "typescript";

const docsArgument = process.argv[2];
const toolOnly = process.argv.includes("--tool-only");
const stageArgument = process.argv.find((argument) => argument.startsWith("--stage="));
const stage = toolOnly ? "test" : stageArgument?.split("=")[1] ?? "content";
const stageOrder = ["research", "product", "test", "content"];
const stageIndex = stageOrder.indexOf(stage);

if (!docsArgument || stageIndex === -1) {
  console.error("Usage: node validate-pipeline.mjs <content-docs-tool-directory> [--stage=research|product|test|content] [--tool-only]");
  process.exit(2);
}

const docsDirectory = resolve(docsArgument);
const errors = [];
const contents = new Map();

const requirements = [
  {
    file: "competitive-report.md",
    sections: [
      "Research scope",
      "Search intent",
      "User pain evidence",
      "Technical truth to verify",
      "Competitor reviews",
      "Comparison matrix",
      "Formula and data disagreements",
      "Evidence-backed opportunities",
      "Sources",
    ],
  },
  {
    file: "implementation-report.md",
    sections: [
      "Product decision",
      "Scope",
      "Formula and data contract",
      "User flow",
      "Interface wireframes",
      "Interaction contract",
      "Page composition",
      "Technical plan",
      "Acceptance criteria",
    ],
  },
  {
    file: "edge-cases-and-tests.md",
    sections: [
      "Risk model",
      "Requirement traceability",
      "Coverage checklist",
      "Edge-case matrix",
      "Formula or resolution fixtures",
      "Test plan",
      "Manual verification",
      "Plan completion criteria",
    ],
  },
  {
    file: "writing-and-seo.md",
    sections: [
      "Search intent",
      "Page promise",
      "Heading and media outline",
      "Formula explanation",
      "Metadata proposal",
      "Internal links",
      "Manual prose handoff",
      "Source ledger",
    ],
  },
];
const activeRequirements = requirements.slice(0, stageIndex + 1);

const upstream = {
  "implementation-report.md": ["competitive-report.md"],
  "edge-cases-and-tests.md": ["competitive-report.md", "implementation-report.md", "brief.md"],
  "writing-and-seo.md": [
    "competitive-report.md",
    "implementation-report.md",
    "edge-cases-and-tests.md",
    "brief.md",
  ],
};

function readRequired(fileName) {
  if (contents.has(fileName)) return contents.get(fileName);
  const filePath = resolve(docsDirectory, fileName);
  try {
    if (!statSync(filePath).isFile()) throw new Error("not a file");
    const content = readFileSync(filePath, "utf8");
    contents.set(fileName, content);
    return content;
  } catch {
    errors.push(`${fileName}: missing required file`);
    contents.set(fileName, null);
    return null;
  }
}

function stripFencedCode(content) {
  return content.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, "");
}

function preamble(content) {
  const index = content.search(/^##\s/m);
  return index === -1 ? content : content.slice(0, index);
}

function uniqueHeader(content, label, fileName) {
  const matcher = new RegExp(`^${label}:\\s*(.+?)\\s*$`, "gmi");
  const matches = [...preamble(content).matchAll(matcher)];
  if (matches.length !== 1) {
    errors.push(`${fileName}: expected exactly one ${label} header`);
    return null;
  }
  return matches[0][1].replace(/^`|`$/g, "").trim();
}

function sectionBody(content, title) {
  const lines = content.split(/\r?\n/);
  let inFence = false;
  let start = -1;
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim().startsWith("```")) inFence = !inFence;
    else if (!inFence && lines[index].trim() === `## ${title}`) {
      start = index;
      break;
    }
  }
  if (start === -1) return null;
  let end = lines.length;
  inFence = false;
  for (let index = start + 1; index < lines.length; index += 1) {
    if (lines[index].trim().startsWith("```")) inFence = !inFence;
    else if (!inFence && lines[index].startsWith("## ")) {
      end = index;
      break;
    }
  }
  return lines.slice(start + 1, end).join("\n").trim();
}

function hash(content) {
  return createHash("sha256").update(content).digest("hex");
}

function placeholderFound(content) {
  return /\[TODO\]|\[\[[^\]\n]{1,200}\]\]/.test(content);
}

function markdownRows(content) {
  const rows = content
    .split(/\r?\n/)
    .filter((line) => /^\s*\|.*\|\s*$/.test(line))
    .map((line) => line.trim().slice(1, -1).split("|").map((cell) => cell.trim()))
    .filter((cells) => !cells.every((cell) => /^:?-{3,}:?$/.test(cell)));
  return rows.slice(1);
}

function competitorSections(content) {
  const lines = content.split(/\r?\n/);
  const starts = [];
  let inFence = false;
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim().startsWith("```")) inFence = !inFence;
    else if (!inFence && /^### Competitor\s+\d+:/.test(lines[index])) starts.push(index);
  }
  return starts.map((start, position) => {
    let end = position + 1 < starts.length ? starts[position + 1] : lines.length;
    if (position + 1 === starts.length) {
      inFence = false;
      for (let index = start + 1; index < lines.length; index += 1) {
        if (lines[index].trim().startsWith("```")) inFence = !inFence;
        else if (!inFence && lines[index].startsWith("## ")) {
          end = index;
          break;
        }
      }
    }
    return lines.slice(start, end).join("\n");
  });
}

function words(content) {
  return (content.toLowerCase().match(/\b[\p{L}\p{N}][\p{L}\p{N}'’-]*\b/gu) ?? []);
}

function staticWordyStrings(filePath) {
  const source = readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, filePath.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const strings = [];
  const proseTags = new Set(["p", "li", "blockquote", "figcaption", "td", "th", "dt", "dd", "h2", "h3", "h4", "h5", "h6"]);
  function tagName(node) {
    return node.tagName?.getText(sourceFile).toLowerCase() ?? "";
  }
  function renderedStaticText(node) {
    if (ts.isJsxText(node) || ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
    if (ts.isTemplateExpression(node)) return `${node.head.text}${node.templateSpans.map((span) => `{dynamic}${span.literal.text}`).join("")}`;
    if (ts.isJsxExpression(node)) return node.expression ? renderedStaticText(node.expression) || " {dynamic} " : "";
    if (ts.isJsxElement(node)) return node.children.map(renderedStaticText).join(" ");
    if (ts.isJsxFragment(node)) return node.children.map(renderedStaticText).join(" ");
    if (ts.isJsxSelfClosingElement(node)) return " {dynamic} ";
    return "";
  }
  function ignoredJsxAttribute(node) {
    let current = node.parent;
    while (current && !ts.isJsxAttribute(current) && !ts.isJsxElement(current) && !ts.isJsxSelfClosingElement(current)) current = current.parent;
    if (!current || !ts.isJsxAttribute(current)) return false;
    const name = current.name.getText(sourceFile);
    return name === "className" || name === "id" || name === "htmlFor" || name === "aria-describedby" || name.startsWith("data-");
  }
  function visit(node, insideProse = false) {
    if (ts.isJsxElement(node) && proseTags.has(tagName(node.openingElement))) {
      const normalized = renderedStaticText(node).replace(/\s+/g, " ").trim();
      if (words(normalized).length >= 8) strings.push(normalized);
      return;
    }
    let value = null;
    if (!insideProse && !ignoredJsxAttribute(node) && (ts.isJsxText(node) || ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))) value = node.text;
    if (!insideProse && !ignoredJsxAttribute(node) && ts.isTemplateExpression(node)) value = renderedStaticText(node);
    if (value) {
      const normalized = value.replace(/\s+/g, " ").trim();
      if (words(normalized).length >= 8) strings.push(normalized);
    }
    ts.forEachChild(node, (child) => visit(child, insideProse));
  }
  visit(sourceFile);
  return [...new Set(strings)];
}

function routeSourceFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...routeSourceFiles(path));
    else if (entry.isFile() && /\.(?:ts|tsx)$/.test(entry.name)) files.push(path);
  }
  return files.sort();
}

const tools = new Map();
const routes = new Map();

for (const requirement of activeRequirements) {
  const content = readRequired(requirement.file);
  if (content === null) continue;

  const status = uniqueHeader(content, "Status", requirement.file);
  if (status !== "ready") errors.push(`${requirement.file}: Status must be ready`);

  const tool = uniqueHeader(content, "Tool", requirement.file);
  if (tool) tools.set(requirement.file, tool);

  const route = uniqueHeader(content, "Route", requirement.file);
  if (!route?.startsWith("/")) {
    errors.push(`${requirement.file}: Route must be absolute`);
  } else {
    routes.set(requirement.file, route);
  }

  for (const title of requirement.sections) {
    const body = sectionBody(content, title);
    if (body === null) {
      errors.push(`${requirement.file}: missing heading ## ${title}`);
    } else if (body.replace(/\s+/g, " ").length < 40) {
      errors.push(`${requirement.file}: section ## ${title} is not substantive`);
    }
  }

  if (placeholderFound(content)) {
    errors.push(`${requirement.file}: contains an unfilled template placeholder`);
  }
}

const brief = stageIndex >= 1 ? readRequired("brief.md") : null;
if (stageIndex >= 1 && brief !== null) {
  for (const title of ["Who is here", "The job", "Show vs say"]) {
    const body = sectionBody(brief, title);
    if (body === null) errors.push(`brief.md: missing heading ## ${title}`);
    else if (body.replace(/\s+/g, " ").length < 30) errors.push(`brief.md: section ## ${title} is not substantive`);
  }
  if (placeholderFound(brief)) errors.push("brief.md: contains an unfilled template placeholder");
}

if (new Set(tools.values()).size > 1) {
  errors.push(`reports disagree on tool identity: ${[...new Set(tools.values())].join(", ")}`);
}

const uniqueRoutes = new Set(routes.values());
if (uniqueRoutes.size > 1) errors.push(`reports disagree on route: ${[...uniqueRoutes].join(", ")}`);

const route = [...uniqueRoutes][0];
const contentDocsMarker = "/content_docs/";
const markerIndex = docsDirectory.lastIndexOf(contentDocsMarker);
if (route && markerIndex !== -1) {
  const docsRoute = `/${docsDirectory.slice(markerIndex + contentDocsMarker.length)}`;
  if (docsRoute !== route) errors.push(`route ${route} does not match docs directory ${docsRoute}`);
}

for (const [fileName, upstreamFiles] of Object.entries(upstream)) {
  if (!activeRequirements.some((requirement) => requirement.file === fileName)) continue;
  const content = readRequired(fileName);
  if (content === null) continue;
  const fingerprints = new Map(
    [...preamble(content).matchAll(/^Input fingerprint:\s*`([^\s`]+) sha256:([a-f0-9]{64})`\s*$/gmi)]
      .map((match) => [match[1], match[2]]),
  );
  for (const upstreamFile of upstreamFiles) {
    const upstreamContent = readRequired(upstreamFile);
    if (upstreamContent === null) continue;
    if (fingerprints.get(upstreamFile) !== hash(upstreamContent)) {
      errors.push(`${fileName}: stale or missing fingerprint for ${upstreamFile}`);
    }
  }
}

const competitive = readRequired("competitive-report.md");
if (competitive !== null) {
  const reviewed = Number(uniqueHeader(competitive, "Direct competitors reviewed", "competitive-report.md"));
  const saturation = uniqueHeader(competitive, "Saturation exception", "competitive-report.md")?.toLowerCase();
  const competitorCount = [...stripFencedCode(competitive).matchAll(/^### Competitor\s+\d+:/gmi)].length;
  if (!Number.isInteger(reviewed) || reviewed < 5) errors.push("competitive-report.md: invalid reviewed competitor count");
  if (reviewed !== competitorCount) errors.push("competitive-report.md: declared and written competitor counts disagree");
  if (reviewed < 8 && saturation !== "yes") errors.push("competitive-report.md: five to seven competitors require a saturation exception");
  if (reviewed >= 8 && saturation !== "no") errors.push("competitive-report.md: saturation exception must be no when eight or more competitors were reviewed");
  if (saturation === "yes") {
    const saturationBody = sectionBody(competitive, "Research scope") ?? "";
    for (const label of ["Queries tried:", "Repeated domains:", "Exclusions:"]) {
      if (!saturationBody.includes(label)) errors.push(`competitive-report.md: saturation evidence missing ${label}`);
    }
  }
  for (const [index, competitor] of competitorSections(competitive).entries()) {
    if (!/https?:\/\//.test(competitor)) errors.push(`competitive-report.md: competitor ${index + 1} has no direct URL`);
    const labels = [...competitor.matchAll(/\[(?:Observed|Documented|Inferred|Unknown)\]/g)].length;
    if (labels < 5) errors.push(`competitive-report.md: competitor ${index + 1} has fewer than five evidence-labeled claims`);
    if (!/```text[\s\S]*?```/i.test(competitor)) errors.push(`competitive-report.md: competitor ${index + 1} has no ASCII wireframe`);
  }
  if (markdownRows(sectionBody(competitive, "Search intent") ?? "").length < 4) errors.push("competitive-report.md: search intent needs at least four distinct query jobs");
  if (markdownRows(sectionBody(competitive, "User pain evidence") ?? "").length < 3) errors.push("competitive-report.md: user pain evidence needs at least three repeated problems");
  if ([...(sectionBody(competitive, "User pain evidence") ?? "").matchAll(/https?:\/\//g)].length < 3) errors.push("competitive-report.md: user pain evidence needs direct community or issue URLs");
  if (markdownRows(sectionBody(competitive, "Technical truth to verify") ?? "").length < 3) errors.push("competitive-report.md: technical truth table needs at least three claims");
  if (markdownRows(sectionBody(competitive, "Comparison matrix") ?? "").length < 5) errors.push("competitive-report.md: comparison matrix needs at least five repeated capabilities");
}

const implementation = stageIndex >= 1 ? readRequired("implementation-report.md") : null;
let requirementIds = [];
let contractType = null;
if (implementation !== null) {
  contractType = uniqueHeader(implementation, "Contract type", "implementation-report.md")?.toLowerCase();
  if (!new Set(["formula", "resolution"]).has(contractType)) errors.push("implementation-report.md: Contract type must be formula or resolution");
  const productDecision = sectionBody(implementation, "Product decision") ?? "";
  for (const label of ["Primary user:", "Job:", "Product thesis:", "Evidence:"]) {
    if (!productDecision.includes(label)) errors.push(`implementation-report.md: product decision missing ${label}`);
  }
  const scope = sectionBody(implementation, "Scope") ?? "";
  for (const heading of ["### Table stakes", "### Launch differentiators", "### Non-goals"]) {
    if (!scope.includes(heading)) errors.push(`implementation-report.md: scope missing ${heading}`);
  }
  const formulaContract = sectionBody(implementation, "Formula and data contract") ?? "";
  for (const heading of ["### Inputs and normalization", "### Equations or resolution order", "### Rounding, display, and versioning", "### Invalid, unknown, absent, and partial states", "### Assumptions and exclusions", "### Primary sources"]) {
    if (!formulaContract.includes(heading)) errors.push(`implementation-report.md: formula/data contract missing ${heading}`);
  }
  if (!/https?:\/\//.test(formulaContract)) errors.push("implementation-report.md: formula/data contract has no primary source URL");
  if (!/```mermaid/i.test(sectionBody(implementation, "User flow") ?? "")) errors.push("implementation-report.md: user flow needs a Mermaid state flow");
  if ([...(sectionBody(implementation, "Interface wireframes") ?? "").matchAll(/```text/g)].length < 2) errors.push("implementation-report.md: interface section needs at least two ASCII state wireframes");
  if (markdownRows(sectionBody(implementation, "Interaction contract") ?? "").length < 2) errors.push("implementation-report.md: interaction contract needs at least two concrete event rows");
  if (markdownRows(sectionBody(implementation, "Page composition") ?? "").length < 2) errors.push("implementation-report.md: page composition needs at least two claim-to-medium rows");
  const technicalPlan = sectionBody(implementation, "Technical plan") ?? "";
  for (const path of ["app/", "lib/", "tests/", "content_docs/"]) {
    if (!technicalPlan.includes(path)) errors.push(`implementation-report.md: technical plan does not assign ${path} ownership`);
  }
  requirementIds = [...(sectionBody(implementation, "Acceptance criteria") ?? "").matchAll(/^\|\s*(R\d+)\s*\|/gmi)].map((match) => match[1]);
  if (requirementIds.length === 0) errors.push("implementation-report.md: acceptance criteria need stable R IDs");
  if (new Set(requirementIds).size !== requirementIds.length) errors.push("implementation-report.md: duplicate acceptance requirement ID");
  if (!/Tool UI/i.test(sectionBody(implementation, "Page composition") ?? "")) {
    errors.push("implementation-report.md: page composition must make the tool UI an explicit visual medium");
  }
}

const edgeCases = stageIndex >= 2 ? readRequired("edge-cases-and-tests.md") : null;
if (edgeCases !== null) {
  const caseRows = markdownRows(sectionBody(edgeCases, "Edge-case matrix") ?? "").filter((row) => /^EC-\d+$/.test(row[0] ?? ""));
  if (caseRows.length < 8) errors.push("edge-cases-and-tests.md: edge-case matrix needs at least eight concrete cases");
  for (const priority of ["P0", "P1"]) {
    if (!caseRows.some((row) => row[1] === priority)) errors.push(`edge-cases-and-tests.md: edge-case matrix has no ${priority} case`);
  }
  for (const row of caseRows) {
    if (row.length < 9 || row.some((cell) => cell.length === 0)) errors.push(`edge-cases-and-tests.md: ${row[0]} is missing a required field`);
    const references = row[row.length - 1].match(/\bR\d+\b/g) ?? [];
    if (references.length === 0) errors.push(`edge-cases-and-tests.md: ${row[0]} has no requirement reference`);
    for (const reference of references) {
      if (!requirementIds.includes(reference)) errors.push(`edge-cases-and-tests.md: ${row[0]} references unknown ${reference}`);
    }
  }
  for (const requirementId of requirementIds) {
    if (!caseRows.some((row) => row.some((cell) => new RegExp(`\\b${requirementId}\\b`).test(cell)))) {
      errors.push(`edge-cases-and-tests.md: ${requirementId} has no edge-case coverage`);
    }
  }
  const coverageFamilies = [
    "Input grammar",
    "Numeric boundaries",
    "Configuration dependencies",
    "Technical truth",
    "Submission and concurrency",
    "Network and upstream",
    "Persistence and sharing",
    "Accessibility",
    "Responsive and themes",
    "Security and privacy",
    "SSR and SEO",
    "Performance",
  ];
  const coverageRows = markdownRows(sectionBody(edgeCases, "Coverage checklist") ?? "");
  for (const family of coverageFamilies) {
    const row = coverageRows.find((candidate) => candidate[0] === family);
    if (!row) errors.push(`edge-cases-and-tests.md: coverage checklist missing ${family}`);
    else if (!/\bEC-\d+\b/.test(row[1] ?? "") && !/^Not applicable:\s+.{12,}/i.test(row[1] ?? "")) {
      errors.push(`edge-cases-and-tests.md: ${family} needs EC references or a specific non-applicability reason`);
    } else {
      for (const reference of (row[1] ?? "").match(/\bEC-\d+\b/g) ?? []) {
        if (!caseRows.some((caseRow) => caseRow[0] === reference)) errors.push(`edge-cases-and-tests.md: ${family} references missing ${reference}`);
      }
    }
  }
  const fixtureRows = markdownRows(sectionBody(edgeCases, "Formula or resolution fixtures") ?? "");
  const expectedPrefix = contractType === "resolution" ? "RF-" : "FF-";
  if (fixtureRows.filter((row) => row[0]?.startsWith(expectedPrefix)).length < 3) {
    errors.push(`edge-cases-and-tests.md: ${contractType ?? "contract"} needs at least three ${expectedPrefix} fixtures`);
  }
  const testPlan = sectionBody(edgeCases, "Test plan") ?? "";
  for (const heading of ["### Pure engine and unit tests", "### Browser tests", "### Static and SEO tests"]) {
    if (!testPlan.includes(heading)) errors.push(`edge-cases-and-tests.md: test plan missing ${heading}`);
  }
  if (markdownRows(sectionBody(edgeCases, "Manual verification") ?? "").length < 4) errors.push("edge-cases-and-tests.md: manual verification needs at least four view/state checks");
}

const writingPlan = stageIndex >= 3 ? readRequired("writing-and-seo.md") : null;
if (writingPlan !== null) {
  const primaryMedium = uniqueHeader(writingPlan, "Primary medium", "writing-and-seo.md");
  const proseMinority = uniqueHeader(writingPlan, "Prose is the minority", "writing-and-seo.md");
  const budget = uniqueHeader(writingPlan, "Static prose budget", "writing-and-seo.md");
  if (primaryMedium !== "Tool UI") errors.push("writing-and-seo.md: Primary medium must be Tool UI");
  if (proseMinority?.toLowerCase() !== "yes") errors.push("writing-and-seo.md: prose must be the minority");
  const budgetMatch = budget?.match(/^(\d+) sections?,\s*(\d+) words maximum$/i);
  if (!budgetMatch) {
    errors.push("writing-and-seo.md: invalid static prose budget");
  } else {
    const sections = Number(budgetMatch[1]);
    const proseBudget = Number(budgetMatch[2]);
    if (sections < 1 || sections > 5 || proseBudget < 1 || proseBudget > 700) {
      errors.push("writing-and-seo.md: prose budget exceeds the default five-section, 700-word ceiling");
    }
  }
  const copyIds = [...new Set([...writingPlan.matchAll(/\bCOPY-\d{2,}\b/g)].map((match) => match[0]))];
  if (copyIds.length === 0) errors.push("writing-and-seo.md: manual prose handoff has no stable COPY IDs");
  const outlineRows = markdownRows(sectionBody(writingPlan, "Heading and media outline") ?? "");
  if (outlineRows.length < 3) errors.push("writing-and-seo.md: heading and media outline needs at least three concrete rows");
  const media = outlineRows.map((row) => row[4]?.toLowerCase() ?? "");
  const allowedMedia = new Set(["tool ui", "exact result visualization", "exact chart", "clean chart", "table", "topology/diagram", "diagram", "screenshot", "marker concept", "sentences"]);
  for (const value of media) {
    if (!allowedMedia.has(value)) errors.push(`writing-and-seo.md: unrecognized medium \"${value}\"; use the controlled visual/prose vocabulary`);
  }
  if (!media.some((value) => value.includes("tool ui"))) {
    errors.push("writing-and-seo.md: heading and media outline omits the tool UI");
  }
  const proseRows = media.filter((value) => value === "sentences").length;
  const nonProseRows = media.filter((value) => value && value !== "sentences").length;
  if (proseRows >= nonProseRows) errors.push("writing-and-seo.md: sentence sections are not a minority of the media outline");
  const budgetSections = budgetMatch ? Number(budgetMatch[1]) : null;
  if (budgetSections !== null && proseRows > budgetSections) errors.push("writing-and-seo.md: outline exceeds the approved prose-section budget");
  const proseRowsById = markdownRows(sectionBody(writingPlan, "Manual prose handoff") ?? "").filter((row) => /^COPY-\d{2,}$/.test(row[0] ?? ""));
  if (proseRowsById.length !== copyIds.length) errors.push("writing-and-seo.md: every COPY ID needs exactly one manual prose assignment row");
  for (const row of proseRowsById) {
    const limit = Number((row[4] ?? "").match(/(\d+)\s+words?/i)?.[1]);
    if (row.length < 6 || !Number.isInteger(limit) || limit < 1) errors.push(`writing-and-seo.md: ${row[0]} needs closed facts, a numeric word limit, and repetition guard`);
  }
  const outlineCopyIds = outlineRows
    .filter((row) => (row[4] ?? "").toLowerCase() === "sentences")
    .map((row) => row[7] ?? "");
  if (outlineCopyIds.some((copyId) => !/^COPY-\d{2,}$/.test(copyId))) errors.push("writing-and-seo.md: every sentence row needs one manual prose section ID");
  if (new Set(outlineCopyIds).size !== outlineCopyIds.length) errors.push("writing-and-seo.md: sentence rows must use unique COPY IDs");
  if (outlineCopyIds.length !== copyIds.length || copyIds.some((copyId) => !outlineCopyIds.includes(copyId))) errors.push("writing-and-seo.md: sentence rows and manual prose assignments must map one-to-one");
  const metadata = sectionBody(writingPlan, "Metadata proposal") ?? "";
  for (const label of ["Registry label:", "Meta title:", "Meta description:", "Page type:", "Publication recommendation:"]) {
    if (!metadata.includes(label)) errors.push(`writing-and-seo.md: metadata proposal missing ${label}`);
  }
  if (markdownRows(sectionBody(writingPlan, "Formula explanation") ?? "").length < 2) errors.push("writing-and-seo.md: formula explanation needs at least two concept rows");
  if (markdownRows(sectionBody(writingPlan, "Internal links") ?? "").length < 2) errors.push("writing-and-seo.md: internal links need at least two reader-path rows");
  if ([...(sectionBody(writingPlan, "Source ledger") ?? "").matchAll(/https?:\/\//g)].length < 3) errors.push("writing-and-seo.md: source ledger needs at least three direct source URLs");
}

if (toolOnly) {
  const markerIndex = docsDirectory.lastIndexOf("/content_docs/");
  if (markerIndex === -1 || !route) {
    errors.push("tool-only audit: cannot resolve the repository route directory");
  } else {
    const repositoryRoot = docsDirectory.slice(0, markerIndex);
    const routeParts = route.split("/").filter(Boolean);
    const routeCandidates = [
      resolve(repositoryRoot, "app", ...routeParts),
      resolve(repositoryRoot, "app", "(site)", ...routeParts),
    ];
    const routeDirectory = routeCandidates.find((candidate) => {
      try {
        return statSync(candidate).isDirectory();
      } catch {
        return false;
      }
    }) ?? routeCandidates[0];
    let sourceFiles = [];
    try {
      sourceFiles = routeSourceFiles(routeDirectory);
    } catch {
      errors.push(`tool-only audit: route source directory is missing: ${join("app", ...routeParts)}`);
    }
    if (sourceFiles.length === 0) errors.push("tool-only audit: no TypeScript or TSX route files found");
    for (const filePath of sourceFiles) {
      for (const value of staticWordyStrings(filePath)) {
        const relativePath = filePath.slice(repositoryRoot.length + 1);
        errors.push(`${relativePath}: tool-only build contains prose-length public text: ${value.slice(0, 120)}`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error("Tool-page pipeline validation failed:");
  for (const error of [...new Set(errors)]) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Tool-page ${stage} stage ready: ${route}${toolOnly ? " with tool-only audit" : ""}`);
