import assert from "node:assert/strict";
import test from "node:test";
import { pageLayoutFailures } from "../../scripts/stack127/quality/page-layout-policy.mjs";

function check(source, css = "", cssPath = "app/test.module.css") {
  return pageLayoutFailures(new Map([["app/test.tsx", source]]), new Map([[cssPath, css]]));
}

test("outer page spacing cannot bypass PageCanvas through a native wrapper", () => {
  assert.match(check('<AppShell><article className="custom">Text</article></AppShell>').join(), /PageCanvas/);
  assert.deepEqual(check('<AppShell><EntryHero art={art}>Title</EntryHero><PageCanvas>Text</PageCanvas></AppShell>'), []);
});

test("page wrappers cannot restore width caps or centering through CSS modules", () => {
  const source = 'import styles from "./test.module.css"; <PageCanvas className={styles.custom}>Text</PageCanvas>';
  assert.match(check(source, '.custom { margin: 0 auto; max-width: 760px; }').join(), /max-width/);
  assert.match(check(source, '@media (max-width: 900px) { .custom { padding: 24px; } }').join(), /padding/);
  assert.deepEqual(check(source, '.custom { display: grid; gap: 24px; } .custom p { max-width: 760px; }'), []);
});

test("global family styles cannot override page gutters", () => {
  assert.match(check('<PageCanvas className="lesson-page" />', '.lesson-page { padding-inline: 72px; }', 'app/course.css').join(), /padding-inline/);
});

test("nested canvases, old width options, and inline page geometry are rejected", () => {
  assert.match(check('<PageCanvas><PageCanvas /></PageCanvas>').join(), /nested/);
  assert.match(check('<PageCanvas><EntryHero art={art} /></PageCanvas>').join(), /nested/);
  assert.match(check('<EntryHero art={art}><PageCanvas /></EntryHero>').join(), /nested/);
  assert.match(check('<EntryHero wide art={art} />').join(), /wide/);
  assert.match(check('<PageCanvas style={{maxWidth: 800}} />').join(), /inline/);
});

test("PageCanvas owns the approved reading width", () => {
  assert.deepEqual(check('<AppShell><PageCanvas reading>Text</PageCanvas></AppShell>'), []);
  assert.match(check('<EntryHero reading art={art} />').join(), /stays wide/);
});
