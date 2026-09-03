import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const globals = await readFile(new URL("../../app/globals.css", import.meta.url), "utf8");
const prose = await readFile(new URL("../../app/prose.module.css", import.meta.url), "utf8");
const cliPage = await readFile(new URL("../../app/(site)/(directories)/cli-apps/page.tsx", import.meta.url), "utf8");
const selfHostPage = await readFile(
  new URL("../../app/(site)/(directories)/self-host-apps/page.tsx", import.meta.url),
  "utf8",
);
const cliLayout = await readFile(
  new URL("../../app/(site)/(directories)/cli-apps/layout.tsx", import.meta.url),
  "utf8",
);
const selfHostLayout = await readFile(
  new URL("../../app/(site)/(directories)/self-host-apps/layout.tsx", import.meta.url),
  "utf8",
);
const directoryFilters = await readFile(
  new URL("../../app/(site)/(directories)/_components/directory-filters.tsx", import.meta.url),
  "utf8",
);

test("one prose system owns reading rhythm", () => {
  for (const token of [
    "--space-prose-paragraph",
    "--space-prose-heading-2",
    "--space-prose-heading-3",
    "--space-prose-section",
  ]) {
    assert.match(globals, new RegExp(token));
    assert.match(prose, new RegExp(token));
  }

  assert.match(prose, /\.flow\s*>\s*:where\(h2\)/);
  assert.match(prose, /\.sectionFlow\s*>\s*section\s*\+\s*section/);
  assert.match(globals, /--space-prose-heading-2:\s*var\(--space-10\)/);
  assert.match(globals, /--space-prose-heading-3:\s*var\(--space-7\)/);
});

test("app directories use the shared directory presentation", () => {
  assert.match(cliLayout, /directory\.css/);
  assert.match(selfHostLayout, /directory\.css/);
  assert.match(cliPage, /directory-filters/);
  assert.match(selfHostPage, /directory-filters/);
  assert.match(directoryFilters, /DirectoryTagSelectGroup/);
  assert.match(cliPage, /DirectoryFilterController/);
  assert.match(selfHostPage, /DirectoryFilterController/);
  assert.doesNotMatch(cliPage, /function TagSelectGroup/);
  assert.doesNotMatch(selfHostPage, /function TagSelectGroup/);
  assert.doesNotMatch(cliPage, /\.\.\/self-host-apps\/sort-dropdown/);
});

test("page families share one visible heading component", async () => {
  const pageHeader = await readFile(new URL("../../app/page-header.tsx", import.meta.url), "utf8");
  const pageCanvas = await readFile(new URL("../../app/page-canvas.tsx", import.meta.url), "utf8");
  const course = await readFile(
    new URL("../../app/(site)/(courses)/self-hosting-for-beginners/course.tsx", import.meta.url),
    "utf8",
  );
  const courseShell = await readFile(new URL("../../app/(site)/(courses)/_components/course-shell.tsx", import.meta.url), "utf8");
  const courseModel = await readFile(new URL("../../lib/courses.ts", import.meta.url), "utf8");
  const shortcuts = await readFile(
    new URL("../../app/(site)/(references)/keyboard-shortcuts/keyboard-shortcuts-directory.tsx", import.meta.url),
    "utf8",
  );

  assert.match(pageHeader, /export function PageHeader/);
  assert.match(pageCanvas, /export function PageCanvas/);
  assert.match(cliPage, /<PageHeader/);
  assert.match(selfHostPage, /<PageHeader/);
  assert.match(course, /CourseLessonPage/);
  assert.match(courseShell, /<PageHeader/);
  assert.match(courseModel, /export type CourseDefinition/);
  assert.match(shortcuts, /<PageHeader/);

  const toolPage = await readFile(
    new URL("../../app/(site)/(tools)/zfs-capacity-calculator/page.tsx", import.meta.url),
    "utf8",
  );
  assert.match(toolPage, /<PageCanvas/);
  assert.match(toolPage, /<ToolPageHeader/);
});

test("directory pages do not expose crawler or development records in the UI", () => {
  assert.doesNotMatch(cliPage, /full app records/i);
  assert.doesNotMatch(selfHostPage, /full app records/i);
  assert.doesNotMatch(cliPage, /DirectoryCrawlerRecords/);
  assert.doesNotMatch(selfHostPage, /DirectoryCrawlerRecords/);
});

test("the scripts index lists every durable script surface", async () => {
  const scriptsRoot = new URL("../../scripts/", import.meta.url);
  const entries = await readdir(scriptsRoot, { withFileTypes: true });
  const folders = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  const index = JSON.parse(await readFile(new URL("scripts.json", scriptsRoot), "utf8"));
  const listed = index.map((entry) => entry.folder.replace("scripts/", "")).sort();

  assert.deepEqual(listed, folders);
});
