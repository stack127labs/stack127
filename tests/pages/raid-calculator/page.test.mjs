import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(new URL("../../../app/(site)/(tools)/raid-calculator/page.tsx", import.meta.url), "utf8");
const client = readFileSync(new URL("../../../app/(site)/(tools)/raid-calculator/raid-calculator.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../../../app/(site)/(catalogs)/storage-tools/storage-tools.module.css", import.meta.url), "utf8");
const canvasStyles = readFileSync(new URL("../../../app/page-canvas.module.css", import.meta.url), "utf8");
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
  assert.match(page, /RAID capacity/);
  assert.match(page, /<mark>calculator<\/mark>/);
  assert.match(client, /aria-label="RAID level"/);
  assert.match(client, /Theoretical usable capacity/);
  assert.match(client, /Where the raw capacity goes/);
  assert.match(client, /Drive arrangement/);
  assert.match(page, /Compare RAID levels/);
  assert.match(page, /The smallest drive sets the size of every group/);
  assert.match(page, /Common RAID capacity questions/);
  assert.match(page, /Everything is calculated in your browser/);
  assert.doesNotMatch(page, /export const metadata|generateMetadata|application\/ld\+json/);
});

test("a clean calculator starts with a visible manual drive inventory", () => {
  assert.match(client, /drives:\s*Object\.freeze\(\[\]\)/);
  assert.match(client, /Drive inventory/);
  assert.match(client, /No drives in this array yet\./);
  assert.match(client, /function addDrive\(\)/);
  assert.match(client, /size:\s*""/);
  assert.match(client, /className=\{styles\.inventoryControls\}/);
  assert.match(client, /\/> Add drive\s*</);
  assert.match(client, /className=\{styles\.inventoryCalculate\}/);
  assert.match(client, /disabled=\{state\.drives\.length === 0\}/);
  assert.doesNotMatch(client, /Build your array|How many drives|Capacity per drive/);
  assert.doesNotMatch(client, /createArrayAndShowResult|setDriveCount|setDriveSize|setDriveUnit/);
  assert.doesNotMatch(client, /Add drives/);
});

test("inventory actions add one real drive and keep calculation explicit", () => {
  assert.match(client, /const \[resultRequested, setResultRequested\] = useState/);
  assert.match(client, />\s*Show result\s*</);
  assert.match(client, /setResultRequested\(false\);/);
  assert.match(client, /\{resultRequested \? \(/);
  assert.match(client, /current\.drives\.map\(\(drive\) => drive\.id === id/);
  assert.doesNotMatch(client, /batchComposer|batchActions|commitDriveBatch|addDriveBatch|arrayComposer|arrayFields/);
  assert.match(styles, /\.inventoryCalculate\s*\{[^}]*background:\s*var\(--color-accent\);/s);
  assert.match(styles, /\.addButton,\s*\.resetButton,\s*\.removeButton\s*\{[^}]*background:\s*var\(--color-surface\);/s);
  assert.match(styles, /\.inventoryCalculate\s*\{[^}]*width:\s*100%;/s);
  assert.match(styles, /\.emptyInventory\s*\{/);
});

test("drive rows and results use the compact visual hierarchy", () => {
  assert.match(client, /styles\.driveTableHeader/);
  assert.match(client, /styles\.capacityBar/);
  assert.match(client, /styles\.resultHeadline/);
  assert.match(client, /styles\.resultFacts/);
  assert.match(client, /styles\.topologyStrip/);
  assert.match(client, /Every supplied byte contributes to this concatenated layout/);
  assert.doesNotMatch(client, /<th scope="row">Raw drive capacity<\/th>/);
  assert.doesNotMatch(client, /group \? <span className=\{styles\.groupTag\}>Group \{group\}<\/span> : <span \/>/);
  assert.match(
    styles,
    /\.driveTableHeader,\s*\.driveRow\s*\{[^}]*grid-template-columns:\s*4\.5rem minmax\(8rem, 1fr\) 7rem 42px;/s,
  );
  assert.match(
    styles,
    /@media \(max-width: 760px\)[\s\S]*?\.driveTableHeader,\s*\.driveRow\s*\{[^}]*grid-template-columns:\s*2\.5rem minmax\(0, 1fr\) 5\.25rem 42px;/,
  );
});

test("the tool keeps exact comparison data in tables and avoids banned treatments", () => {
  assert.match(client, /<dl className=\{styles\.capacityValues\}>/);
  assert.match(page, /<table/);
  assert.doesNotMatch(`${page}\n${client}`, /—|–/);
  assert.doesNotMatch(styles, /border-left\s*:/);
  for (const declaration of styles.match(/font-size\s*:[^;]+;/g) ?? []) {
    assert.match(declaration, /var\(--text-(?:body|small|h1|h2|h3)\)/);
  }
});

test("the page owns a centered reading column with real outer gutters", () => {
  const pageRule = canvasStyles.match(/\.canvas\s*\{([^}]*)\}/s)?.[1] ?? "";
  const toolRule = styles.match(/\.tool\s*\{([^}]*)\}/s)?.[1] ?? "";
  const referenceRule = styles.match(/\.reference\s*\{([^}]*)\}/s)?.[1] ?? "";

  assert.match(pageRule, /margin:\s*0 auto;/);
  assert.match(pageRule, /max-width:\s*1120px;/);
  assert.match(pageRule, /padding:\s*var\(--space-13\) var\(--container-gutter\) var\(--space-14\);/);
  assert.match(pageRule, /width:\s*100%;/);
  assert.match(toolRule, /background:\s*var\(--color-surface\);/);
  assert.match(page, /\$\{styles\.reference\} \$\{proseClassName\} \$\{proseSectionFlowClassName\}/);
  assert.match(referenceRule, /display:\s*grid;/);
  assert.match(referenceRule, /gap:\s*var\(--space-8\);/);
  assert.match(page, /<PageCanvas>/);
});

test("clean visits stay clean until the visitor changes calculator inputs", () => {
  assert.match(client, /const userHasEdited = useRef\(false\);/);
  assert.match(client, /if \(!userHasEdited\.current\) return;/);
  assert.match(client, /userHasEdited\.current = true;/);
  assert.match(client, /url\.searchParams\.delete\("state"\);/);
  assert.match(client, /url\.searchParams\.set\("state", encoded\);/);
  assert.match(client, /state\.drives\.length === 0/);
});
