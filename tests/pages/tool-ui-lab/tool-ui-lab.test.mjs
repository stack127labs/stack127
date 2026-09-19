import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("the temporary lab stays development-only and renders the working component collection", async () => {
  const [page, lab] = await Promise.all([
    source("app/(site)/tool-ui-lab/page.tsx"),
    source("app/(site)/tool-ui-lab/tool-ui-lab.tsx"),
  ]);
  const siteLayout = await source("app/(site)/layout.tsx");

  assert.match(page, /process\.env\.NODE_ENV\s*!==\s*["']development["']/);
  assert.match(page, /notFound\(\)/);
  assert.match(siteLayout, /DEVELOPMENT_ONLY_PATHS/);
  assert.match(siteLayout, /tool-ui-lab/);
  for (const component of [
    "ToolTextField",
    "ToolSearchField",
    "ToolSelect",
    "ToolComboBox",
    "ToolNumberField",
    "ToolQuantityField",
    "ToolQuantityInput",
    "ToolSlider",
    "ToolRangeSlider",
    "ToolChoiceGroup",
    "ToolCheckbox",
    "ToolSwitch",
    "ToolDisclosure",
    "ToolRepeatableList",
    "ToolStatus",
    "ToolPrimaryResult",
    "ToolProgressBar",
    "ToolAllocationBar",
    "ToolRawOutput",
    "ToolCodeOutput",
    "ToolCopyAction",
    "ToolDownloadAction",
    "ToolMetricGroup",
    "ToolTimeline",
    "ToolDataTable",
    "ToolDatePicker",
    "ToolLevelSlider",
    "ToolFileDropzone",
    "ToolFileList",
    "ToolBarChart",
    "ToolLineChart",
    "ToolFlowChart",
  ]) {
    assert.match(lab, new RegExp(`<${component}\\b`), `${component} must have a working lab example`);
  }
});

test("uploads use accessible shared drop zones and file lists", async () => {
  const [uploads, lab] = await Promise.all([
    source("app/tool-ui/tool-uploads.tsx"),
    source("app/(site)/tool-ui-lab/tool-ui-lab.tsx"),
  ]);

  assert.match(uploads, /DropZone/);
  assert.match(uploads, /FileTrigger/);
  assert.match(uploads, /acceptedFileTypes/);
  assert.match(uploads, /maxSizeBytes/);
  assert.match(uploads, /onReject/);
  assert.match(uploads, /<progress\b/);
  assert.match(uploads, /aria-label=\{`Remove/);
  assert.match(lab, /acceptedFileTypes=\{\["application\/pdf"\]\}/);
  assert.match(lab, /acceptedFileTypes=\{\["image\/png", "image\/jpeg", "image\/webp"\]\}/);
});

test("shared charts retain exact values and semantic fallbacks", async () => {
  const visuals = await source("app/tool-ui/tool-visuals.tsx");

  assert.match(visuals, /export function ToolBarChart/);
  assert.match(visuals, /export function ToolLineChart/);
  assert.match(visuals, /export function ToolFlowChart/);
  assert.match(visuals, /<svg\b/);
  assert.match(visuals, /<table\b/);
  assert.match(visuals, /<ol\b/);
  assert.doesNotMatch(visuals, /gradient/i);
});

test("date and level selectors use purpose-built accessible controls", async () => {
  const controls = await source("app/tool-ui/tool-controls.tsx");

  assert.match(controls, /export function ToolDatePicker/);
  assert.match(controls, /<DateInput\b/);
  assert.match(controls, /<CalendarGrid\b/);
  assert.match(controls, /export function ToolLevelSlider/);
  assert.match(controls, /aria-valuetext/);
});

test("shared selects are custom listboxes rather than native select elements", async () => {
  const controls = await source("app/tool-ui/tool-controls.tsx");

  assert.match(controls, /from ["']react-aria-components["']/);
  assert.match(controls, /RacSelect/);
  assert.match(controls, /ListBox/);
  assert.doesNotMatch(controls, /<select\b/);
});

test("the shared field contract owns labels, required marks, descriptions, and errors", async () => {
  const controls = await source("app/tool-ui/tool-controls.tsx");

  assert.match(controls, /Required/);
  assert.match(controls, /aria-hidden="true"/);
  assert.match(controls, /FieldError/);
  assert.match(controls, /slot="description"/);
});

test("the shared search field keeps one clear control", async () => {
  const styles = await source("app/tool-ui/tool-controls.module.css");

  assert.match(styles, /\.searchInput::-webkit-search-cancel-button/);
  assert.match(styles, /-webkit-appearance:\s*none/);
});

test("shared result components use semantic output structures", async () => {
  const [controls, lab, styles] = await Promise.all([
    source("app/tool-ui/tool-controls.tsx"),
    source("app/(site)/tool-ui-lab/tool-ui-lab.tsx"),
    source("app/tool-ui/tool-controls.module.css"),
  ]);

  assert.match(styles, /\.resultLead\s*\{[^}]*min-width:\s*0/);
  assert.match(styles, /\.resultLead\s*\{[^}]*overflow-wrap:\s*anywhere/);
  assert.match(controls, /export function ToolPrimaryResult/);
  assert.match(controls, /<output\b/);
  assert.match(controls, /export function ToolProgressBar/);
  assert.match(controls, /<progress\b/);
  assert.match(controls, /export function ToolAllocationBar/);
  assert.match(controls, /ToolAllocationPalette/);
  for (const palette of ["neutral", "accent", "categorical"]) {
    assert.match(lab, new RegExp(`palette=["']${palette}["']`));
  }
  assert.match(controls, /export function ToolMetricGroup/);
  assert.match(controls, /export function ToolTimeline/);
});

test("allocation palettes use shared data colors and retain explicit values", async () => {
  const [globals, controls, styles] = await Promise.all([
    source("app/globals.css"),
    source("app/tool-ui/tool-controls.tsx"),
    source("app/tool-ui/tool-controls.module.css"),
  ]);

  for (const color of ["chartreuse", "cyan", "blue", "yellow", "red", "violet", "green"]) {
    assert.match(globals, new RegExp(`--color-data-${color}:`));
    assert.match(styles, new RegExp(`\\.allocation${color[0].toUpperCase()}${color.slice(1)}`));
  }
  assert.match(controls, /value:\s*number\s*\|\s*bigint/);
  assert.doesNotMatch(controls, /Number\(segment\.value\)/);
});

test("raw and code output own their overflow", async () => {
  const [controls, styles] = await Promise.all([
    source("app/tool-ui/tool-controls.tsx"),
    source("app/tool-ui/tool-controls.module.css"),
  ]);

  assert.match(controls, /export function ToolRawOutput/);
  assert.match(controls, /export function ToolCodeOutput/);
  assert.match(styles, /\.rawViewport[\s\S]*overflow:\s*auto/);
  assert.match(styles, /\.codeViewport[\s\S]*overflow:\s*auto/);
});
