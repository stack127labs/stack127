import assert from "node:assert/strict";
import test from "node:test";
import {
  concepts,
  findLicenseAnchor,
  licenseGroups,
  licensePage,
  licenses,
} from "../../../lib/software-licenses.ts";

test("license page has intro copy and grouped licenses", () => {
  assert.equal(licensePage.title, "Software licenses for self-hosters");
  assert.ok(licensePage.lede.length > 40);
  assert.ok(licensePage.notLegalAdvice.toLowerCase().includes("not legal advice"));
  assert.ok(licenseGroups.length >= 6);
  assert.ok(concepts.length >= 2);
  assert.ok(concepts.length <= 3);
  assert.ok(licenses.length >= 25);
});

test("every concept and license has a unique stable id", () => {
  const ids = [
    ...concepts.map((entry) => entry.id),
    ...licenses.map((entry) => entry.id),
    ...licenseGroups.map((entry) => entry.id),
  ];
  assert.equal(ids.length, new Set(ids).size);
  for (const id of ids) {
    assert.match(id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  }
});

test("license entries include the self-host decision fields", () => {
  const requiredFactKeys = [
    "osiOpenSource",
    "homeSelfHost",
    "commercialInternal",
    "modify",
    "redistribute",
    "offerAsService",
    "copyleft",
    "notices",
  ];

  for (const license of licenses) {
    assert.ok(license.name, `missing name for ${license.id}`);
    assert.ok(license.sidebarLabel, `missing sidebarLabel for ${license.id}`);
    assert.ok(license.summary.length > 20, `short summary for ${license.id}`);
    assert.ok(license.forUsers.length >= 1, `missing forUsers for ${license.id}`);
    assert.ok(license.forCreators.length >= 1, `missing forCreators for ${license.id}`);
    assert.ok(license.officialUrl.startsWith("http"), `bad officialUrl for ${license.id}`);
    assert.ok(Array.isArray(license.aliases), `aliases missing for ${license.id}`);
    for (const key of requiredFactKeys) {
      assert.ok(String(license.facts[key] ?? "").trim(), `${license.id} missing fact ${key}`);
    }
  }
});

test("core self-host licenses are present", () => {
  const ids = new Set(licenses.map((entry) => entry.id));
  for (const required of [
    "mit",
    "apache-2-0",
    "gpl-2-0",
    "gpl-3-0",
    "agpl-3-0",
    "mpl-2-0",
    "lgpl-3-0",
    "sspl-1-0",
    "elastic-license-2-0",
    "bsl-1-1",
    "fsl",
    "polyform-noncommercial",
    "proprietary-eula",
    "dual-licensing",
    "community-enterprise-split",
  ]) {
    assert.ok(ids.has(required), `missing required license section ${required}`);
  }
});

test("license prose avoids em and en dashes", () => {
  const chunks = [
    licensePage.title,
    licensePage.lede,
    licensePage.notLegalAdvice,
    ...concepts.flatMap((entry) => [entry.title, ...entry.paragraphs]),
    ...licenses.flatMap((entry) => [
      entry.name,
      entry.summary,
      entry.commonMistake ?? "",
      ...entry.forUsers,
      ...entry.forCreators,
      ...Object.values(entry.facts),
    ]),
  ].join("\n");

  assert.equal(chunks.includes("\u2014"), false, "found em dash");
  assert.equal(chunks.includes("\u2013"), false, "found en dash");
});

test("findLicenseAnchor maps directory labels to section ids", () => {
  assert.equal(findLicenseAnchor("MIT"), "mit");
  assert.equal(findLicenseAnchor("AGPL-3.0"), "agpl-3-0");
  assert.equal(findLicenseAnchor("SSPL-1.0"), "sspl-1-0");
  assert.equal(findLicenseAnchor("Elastic License 2.0"), "elastic-license-2-0");
  assert.equal(findLicenseAnchor("AGPL-3.0/MIT"), "agpl-3-0");
  assert.equal(findLicenseAnchor("totally-unknown-license-xyz"), null);
});
