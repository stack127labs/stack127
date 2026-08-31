import assert from "node:assert/strict";
import { test } from "node:test";
import { declaredSpdxFromManifest, detectSpdxLicense } from "../../../scripts/self-host-apps/lib/license-detection.mjs";

test("license detector identifies common open and source-available texts", () => {
  assert.equal(detectSpdxLicense("MIT License\nPermission is hereby granted, free of charge, to any person obtaining a copy"), "MIT");
  assert.equal(detectSpdxLicense("Permission is hereby granted, free of charge, to any person\nobtaining a copy"), "MIT");
  assert.equal(detectSpdxLicense("GNU AFFERO GENERAL PUBLIC LICENSE\nVersion 3, 19 November 2007"), "AGPL-3.0-only");
  assert.equal(detectSpdxLicense("Business Source License 1.1"), "BUSL-1.1");
  assert.equal(detectSpdxLicense("SPDX-License-Identifier: EPL-2.0 OR BSD-3-Clause"), "EPL-2.0 OR BSD-3-Clause");
  assert.equal(detectSpdxLicense("PolyForm Noncommercial License 1.0.0"), "PolyForm-Noncommercial-1.0.0");
  assert.equal(detectSpdxLicense("This software is released under the PostgreSQL licence."), "PostgreSQL");
});

test("accepts explicit manifest SPDX values and rejects unlicensed package markers", () => {
  assert.equal(declaredSpdxFromManifest("package.json", JSON.stringify({ license: "Apache-2.0" })), "Apache-2.0");
  assert.equal(declaredSpdxFromManifest("Cargo.toml", '[package]\nlicense = "MIT OR Apache-2.0"'), "MIT OR Apache-2.0");
  assert.equal(declaredSpdxFromManifest("package.json", JSON.stringify({ license: "UNLICENSED" })), null);
});
