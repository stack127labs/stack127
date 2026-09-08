import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { readToolPageSeed } from "../../helpers/tool-page-content.mjs";

const page = readFileSync(new URL("../../../app/(site)/(tools)/raid-calculator/page.tsx", import.meta.url), "utf8");
const client = readFileSync(new URL("../../../app/(site)/(tools)/raid-calculator/raid-calculator.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../../../app/(site)/(tools)/raid-calculator/raid-calculator.module.css", import.meta.url), "utf8");
const workbenchStyles = readFileSync(new URL("../../../app/(site)/_components/tool-workbench.css", import.meta.url), "utf8");
const canvasStyles = readFileSync(new URL("../../../app/page-canvas.module.css", import.meta.url), "utf8");
const content = readToolPageSeed("raid-calculator");
const manifestPath = new URL("page.json", import.meta.url);
const migrationPath = new URL(
  "../../../supabase/migrations/20260809140000_publish_storage_tools.sql",
  import.meta.url,
);

test("the RAID route is registry published through the storage migration", () => {
  assert.equal(existsSync(migrationPath), true);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.equal(manifest.route, "/raid-calculator");
  assert.equal(manifest.state, "published");
  assert.match(readFileSync(migrationPath, "utf8"), /'raid-calculator'/);
});

test("the RAID page follows the approved answer-first visual structure", () => {
  assert.match(page, /getRequiredToolPage\("raid-calculator"\)/);
  assert.match(page, /<ToolPageHeader/);
  assert.match(client, /label="RAID level"/);
  assert.match(client, /Theoretical usable capacity/);
  assert.match(client, /Raw capacity allocation/);
  assert.match(client, /Nested drive groups/);
  assert.match(content, /Compare RAID levels/);
  assert.match(content, /smallest drive/i);
  assert.match(content, /Common RAID capacity questions/);
  assert.match(content, /calculated in your browser/i);
  assert.doesNotMatch(page, /export const metadata|generateMetadata|application\/ld\+json/);
});

test("a clean calculator starts with a visible manual drive inventory", () => {
  assert.match(client, /drives:\s*Object\.freeze\(\[\]\)/);
  assert.match(client, /Drive inventory/);
  assert.match(client, /No drives added\./);
  assert.match(client, /function addDrive\(\)/);
  assert.match(client, /size:\s*""/);
  assert.match(client, /<ToolRepeatableList/);
  assert.match(client, /addLabel="Add drive"/);
  assert.match(client, /<ToolQuantityInput/);
  assert.match(client, /<ToolButton[^>]*type="submit"/s);
  assert.doesNotMatch(client, /Build your array|How many drives|Capacity per drive/);
  assert.doesNotMatch(client, /createArrayAndShowResult|setDriveCount|setDriveSize|setDriveUnit/);
  assert.doesNotMatch(client, /Add drives/);
});

test("inventory actions add one real drive and keep calculation explicit", () => {
  assert.match(client, /const \[calculated, setCalculated\] = useState/);
  assert.match(client, />\s*Calculate capacity\s*</);
  assert.match(client, /setCalculated\(null\);/);
  assert.match(client, /current\.drives\.map\(\(drive\) => drive\.id === id/);
  assert.doesNotMatch(client, /batchComposer|batchActions|commitDriveBatch|addDriveBatch|arrayComposer|arrayFields/);
  assert.match(styles, /\.emptyInventory\s*\{/);
});

test("drive rows and results use the shared component hierarchy", () => {
  for (const component of [
    "ToolChoiceGroup",
    "ToolQuantityInput",
    "ToolRepeatableList",
    "ToolButton",
    "ToolPrimaryResult",
    "ToolAllocationBar",
    "ToolDataTable",
    "ToolKeyValueList",
    "ToolDisclosure",
  ]) assert.match(client, new RegExp(`<${component}`));
  assert.match(client, /palette="categorical"/);
  assert.match(client, /tone: "chartreuse"/);
  assert.match(client, /tone: "cyan"/);
  assert.match(client, /tone: "violet"/);
  assert.match(client, /nestedLevels\.has\(values\.level\)/);
  assert.doesNotMatch(client, /Where the raw capacity goes|Drive arrangement|RAID is not backup/);
  assert.doesNotMatch(client, /warningText|backupNote|capacityBar|topologyStrip/);
});

test("the tool keeps exact comparison data in tables and avoids banned treatments", () => {
  assert.match(client, /<ToolAllocationBar/);
  assert.match(content, /^\| Layout \| Minimum drives/m);
  assert.doesNotMatch(`${page}\n${client}`, /—|–/);
  assert.doesNotMatch(styles, /border-left\s*:/);
  for (const declaration of styles.match(/font-size\s*:[^;]+;/g) ?? []) {
    assert.match(declaration, /var\(--text-(?:body|small|h1|h2|h3)\)/);
  }
});

test("the page owns a centered reading column with real outer gutters", () => {
  const pageRule = canvasStyles.match(/\.canvas\s*\{([^}]*)\}/s)?.[1] ?? "";
  const toolRule = styles.match(/\.tool\s*\{([^}]*)\}/s)?.[1] ?? "";

  assert.match(pageRule, /margin:\s*0 auto;/);
  assert.match(pageRule, /max-width:\s*1120px;/);
  assert.match(pageRule, /padding:\s*var\(--space-13\) var\(--container-gutter\) var\(--space-14\);/);
  assert.match(pageRule, /width:\s*100%;/);
  assert.match(workbenchStyles, /background:\s*var\(--color-surface\);/);
  assert.doesNotMatch(toolRule, /border:\s*1\.5px|border-radius:/);
  assert.match(client, /data-tool-workbench/);
  assert.match(page, /<ToolPageMarkdown/);
  assert.match(page, /<PageCanvas>/);
});

test("clean visits stay clean until the visitor changes calculator inputs", () => {
  assert.match(client, /const userHasEdited = useRef\(false\);/);
  assert.match(client, /if \(!userHasEdited\.current\) return;/);
  assert.match(client, /userHasEdited\.current = true;/);
  assert.match(client, /url\.searchParams\.delete\("state"\);/);
  assert.match(client, /url\.searchParams\.set\("state", raidCalculatorRegistry\.encode/);
  assert.match(client, /state\.drives\.length === 0/);
});

test("required result-driving inputs stay visible and errors have one owner", () => {
  assert.match(client, /<ToolChoiceGroup[\s\S]*?label="RAID level"[\s\S]*?required/);
  assert.match(client, /<ToolQuantityInput[\s\S]*?required/);
  assert.match(client, /<ToolNumberField[\s\S]*?Drives per/);
  assert.doesNotMatch(client, /<ToolDisclosure\s+label="(?:RAID level|Drive inventory|Drives per)/);
  assert.match(client, /driveErrors\[drive\.id\]/);
  assert.match(client, /inventoryError/);
  assert.match(client, /groupSizeError/);
});
