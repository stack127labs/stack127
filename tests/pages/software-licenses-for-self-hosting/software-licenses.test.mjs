import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  findDirectoryLicenseId,
  findLicenseAnchor,
  licenseGroups,
  licensePage,
  licenses,
} from "../../../lib/software-licenses.ts";

test("license page has intro copy and grouped licenses", () => {
  assert.equal(licensePage.title, "Software licenses for self-hosting");
  assert.ok(licensePage.lede.length > 40);
  assert.ok(licensePage.notLegalAdvice.toLowerCase().includes("not legal advice"));
  assert.ok(licenseGroups.length >= 6);
  assert.ok(licenses.length >= 25);
});

test("every group and license has a unique stable id", () => {
  const ids = [
    ...licenses.map((entry) => entry.id),
    ...licenseGroups.map((entry) => entry.id),
  ];
  assert.equal(ids.length, new Set(ids).size);
  for (const id of ids) {
    assert.match(id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  }
});

test("license cards carry one short, complete explanation", () => {
  for (const license of licenses) {
    assert.ok(license.name, `missing name for ${license.id}`);
    assert.ok(license.sidebarLabel, `missing sidebarLabel for ${license.id}`);
    assert.ok(license.summary.length > 20, `short summary for ${license.id}`);
    assert.ok(license.summary.length <= 260, `long summary for ${license.id}`);
    assert.match(license.summary, /[.!?]$/, `summary is not a full sentence for ${license.id}`);
    const sentences = license.summary.match(/[.!?](?=\s|$)/g) ?? [];
    assert.ok(sentences.length <= 2, `summary has more than two sentences for ${license.id}`);
    assert.ok(Array.isArray(license.aliases), `aliases missing for ${license.id}`);
    if (license.officialUrl !== null) {
      assert.ok(license.officialUrl.startsWith("http"), `bad officialUrl for ${license.id}`);
    }
    assert.ok(Array.isArray(license.conditions), `conditions missing for ${license.id}`);
    for (const condition of license.conditions) {
      assert.ok(condition.label.trim(), `${license.id} has a condition without a label`);
      assert.ok(condition.text.trim(), `${license.id} has a condition without text`);
    }
  }
});

test("license cards render the concise explanation and actions, not the old detail stack", () => {
  const pageSource = readFileSync(
    new URL(
      "../../../app/(site)/(references)/software-licenses-for-self-hosting/page.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(pageSource, /license\.summary/);
  assert.match(pageSource, /Browse .*apps/);
  assert.match(
    pageSource,
    /The licenses below are grouped by family, with links to the official text and\s+popular self-hosted apps that use each one\./,
  );
  assert.doesNotMatch(pageSource, /Each card gives you the point/);
  assert.doesNotMatch(pageSource, /license\.osiNote/);
  assert.doesNotMatch(pageSource, /license\.conditions/);
  assert.doesNotMatch(pageSource, /license\.forUsers/);
  assert.doesNotMatch(pageSource, /license\.forCreators/);
  assert.doesNotMatch(pageSource, /license\.commonMistake/);
  assert.doesNotMatch(pageSource, /Running it:/);
  assert.doesNotMatch(pageSource, /Licensing your own app:/);
  assert.doesNotMatch(pageSource, /Common mistake:/);
});

test("every license carries one-word verdicts for the table", () => {
  const allowed = new Set(["yes", "no", "careful", "depends"]);
  const osiAllowed = new Set(["yes", "no", "pd", "n.a.", "depends"]);
  const verdictKeys = ["selfHost", "companyUse", "service", "modify", "redistribute"];

  for (const license of licenses) {
    assert.ok(license.verdicts, `missing verdicts for ${license.id}`);
    for (const key of verdictKeys) {
      assert.ok(
        allowed.has(license.verdicts[key]),
        `${license.id} verdict ${key} is "${license.verdicts[key]}", expected yes/no/careful/depends`,
      );
    }
    assert.ok(
      osiAllowed.has(license.verdicts.osi),
      `${license.id} osi verdict is "${license.verdicts.osi}"`,
    );
    assert.ok(
      String(license.verdicts.copyleft ?? "").trim(),
      `${license.id} missing copyleft class`,
    );
  }
});

test("every qualified verdict has a matching explanation", () => {
  const verdictLabels = {
    selfHost: "Self-host",
    companyUse: "Company",
    service: "Service",
    modify: "Modify",
    redistribute: "Redistribute",
  };

  for (const license of licenses) {
    const labels = new Set(license.conditions.map((condition) => condition.label));
    for (const [key, label] of Object.entries(verdictLabels)) {
      if (license.verdicts[key] === "yes") continue;
      assert.ok(
        labels.has(label) || labels.has("Everything"),
        `${license.id} has ${license.verdicts[key]} for ${key} without a ${label} or Everything condition`,
      );
    }
  }
});

test("SSPL permits ordinary internal company use and keeps service use qualified", () => {
  const sspl = licenses.find((license) => license.id === "sspl-1-0");
  assert.ok(sspl);
  assert.equal(sspl.verdicts.companyUse, "yes");
  assert.equal(sspl.verdicts.service, "careful");
});

test("official links are accurate and their labels describe the destination", () => {
  const byId = new Map(licenses.map((license) => [license.id, license]));

  assert.equal(
    byId.get("polyform-shield")?.officialUrl,
    "https://polyformproject.org/licenses/shield/1.0.0",
  );
  assert.equal(
    byId.get("polyform-noncommercial")?.officialUrl,
    "https://polyformproject.org/licenses/noncommercial/1.0.0",
  );
  assert.equal(byId.get("proprietary-eula")?.officialUrl, null);
  assert.equal(byId.get("busl-1-1")?.officialLinkLabel, "Official BSL guidance");
  assert.equal(byId.get("fsl")?.officialLinkLabel, "Official FSL site");
  assert.equal(byId.get("sustainable-use")?.officialLinkLabel, "Example license text");
});

test("AGPL and missing-license answers keep their legal triggers precise", () => {
  const pageSource = readFileSync(
    new URL(
      "../../../app/(site)/(references)/software-licenses-for-self-hosting/page.tsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(pageSource, /Unmodified upstream does not trigger AGPL section 13/);
  assert.match(pageSource, /If you modify it and someone else, including family, uses it remotely/);
  assert.match(pageSource, /README, documentation, or another file/);
  assert.doesNotMatch(pageSource, /modified or not, for yourself and your household triggers nothing/);
  assert.doesNotMatch(pageSource, /whatever the README suggests/);
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
    "busl-1-1",
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
    ...licenseGroups.map((entry) => entry.intro ?? ""),
    ...licenses.flatMap((entry) => [
      entry.name,
      entry.summary,
      entry.osiNote ?? "",
      entry.commonMistake ?? "",
      entry.forUsers,
      entry.forCreators,
      ...entry.conditions.flatMap((condition) => [condition.label, condition.text]),
      ...Object.values(entry.verdicts),
    ]),
  ].join("\n");

  assert.equal(chunks.includes("—"), false, "found em dash");
  assert.equal(chunks.includes("–"), false, "found en dash");
});

test("findLicenseAnchor maps directory labels to section ids", () => {
  assert.equal(findLicenseAnchor("MIT"), "mit");
  assert.equal(findLicenseAnchor("AGPL-3.0"), "agpl-3-0");
  assert.equal(findLicenseAnchor("SSPL-1.0"), "sspl-1-0");
  assert.equal(findLicenseAnchor("Elastic License 2.0"), "elastic-license-2-0");
  assert.equal(findLicenseAnchor("BSL 1.1"), "busl-1-1");
  assert.equal(findLicenseAnchor("AGPL-3.0/MIT"), "agpl-3-0");
  assert.equal(findLicenseAnchor("totally-unknown-license-xyz"), null);
});

test("directory license matching prefers SPDX and falls back to reviewed labels", () => {
  assert.equal(findDirectoryLicenseId("AGPL-3.0-only", "GNU AGPLv3"), "agpl-3-0");
  assert.equal(findDirectoryLicenseId(null, "Elastic License 2.0"), "elastic-license-2-0");
  assert.equal(findDirectoryLicenseId("NOASSERTION", "MIT with exceptions"), null);
  assert.equal(findDirectoryLicenseId(null, "totally-unknown-license-xyz"), null);
});
