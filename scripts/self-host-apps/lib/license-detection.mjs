export function detectSpdxLicense(text) {
  const source = String(text ?? "").replace(/\r/g, "");
  const upper = source.toUpperCase();
  const compactUpper = upper.replace(/\s+/g, " ");
  const declared = source.match(/SPDX-License-Identifier:\s*([A-Za-z0-9.+-]+(?:\s+(?:AND|OR|WITH)\s+[A-Za-z0-9.+-]+)*)/i)?.[1];
  if (declared) return declared;
  if (/POLYFORM NONCOMMERCIAL LICENSE\s*1\.0\.0/i.test(source)) return "PolyForm-Noncommercial-1.0.0";
  if (/CREATIVE COMMONS ATTRIBUTION-SHAREALIKE 4\.0 INTERNATIONAL/i.test(source)) return "CC-BY-SA-4.0";
  if (/ATTRIBUTION-NONCOMMERCIAL-NODERIVS 2\.0 GENERIC/i.test(source)) return "CC-BY-NC-ND-2.0";
  if (/ATTRIBUTION-NONCOMMERCIAL-SHAREALIKE 4\.0 INTERNATIONAL/i.test(source)) return "CC-BY-NC-SA-4.0";
  if (/ATTRIBUTION-NONCOMMERCIAL 4\.0 INTERNATIONAL/i.test(source) || /CC BY-NC 4\.0/i.test(source)) return "CC-BY-NC-4.0";
  if (/RELEASED UNDER THE POSTGRESQL LICEN[CS]E/i.test(source)) return "PostgreSQL";
  if (/2-CLAUSE BSD LICENSE WITH THE COMMONS CLAUSE/i.test(source)) return "BSD-2-Clause WITH Commons-Clause";
  if (/BUSINESS SOURCE LICENSE\s*(?:VERSION\s*)?1\.1/i.test(source)) return "BUSL-1.1";
  if (upper.includes("SERVER SIDE PUBLIC LICENSE")) return "SSPL-1.0";
  if (upper.includes("ELASTIC LICENSE 2.0")) return "Elastic-2.0";
  if (upper.includes("GNU AFFERO GENERAL PUBLIC LICENSE") && /VERSION 3/i.test(source)) return "AGPL-3.0-only";
  if (upper.includes("GNU LESSER GENERAL PUBLIC LICENSE") && /VERSION 3/i.test(source)) return "LGPL-3.0-only";
  if (upper.includes("GNU LESSER GENERAL PUBLIC LICENSE") && /VERSION 2\.1/i.test(source)) return "LGPL-2.1-only";
  if (upper.includes("GNU GENERAL PUBLIC LICENSE") && /VERSION 3/i.test(source)) return "GPL-3.0-only";
  if (upper.includes("GNU GENERAL PUBLIC LICENSE") && /VERSION 2/i.test(source)) return "GPL-2.0-only";
  if (upper.includes("APACHE LICENSE") && /VERSION 2\.0/i.test(source)) return "Apache-2.0";
  if (upper.includes("MOZILLA PUBLIC LICENSE") && /VERSION 2\.0/i.test(source)) return "MPL-2.0";
  if (upper.includes("ECLIPSE PUBLIC LICENSE") && /VERSION 2\.0/i.test(source)) return "EPL-2.0";
  if (compactUpper.includes("PERMISSION IS HEREBY GRANTED, FREE OF CHARGE, TO ANY PERSON OBTAINING A COPY")) return "MIT";
  if (compactUpper.includes("REDISTRIBUTION AND USE IN SOURCE AND BINARY FORMS") && compactUpper.includes("NEITHER THE NAME")) return "BSD-3-Clause";
  if (compactUpper.includes("REDISTRIBUTION AND USE IN SOURCE AND BINARY FORMS") && compactUpper.includes("THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS")) return "BSD-2-Clause";
  if (compactUpper.includes("PERMISSION TO USE, COPY, MODIFY, AND/OR DISTRIBUTE THIS SOFTWARE FOR ANY PURPOSE WITH OR WITHOUT FEE")) return "ISC";
  if (compactUpper.includes("THIS IS FREE AND UNENCUMBERED SOFTWARE RELEASED INTO THE PUBLIC DOMAIN")) return "Unlicense";
  return null;
}

function plausibleSpdx(value) {
  const license = String(value ?? "").trim();
  if (!license || /^(?:UNLICENSED|NONE|NOASSERTION|SEE LICENSE)/i.test(license)) return null;
  return /^[A-Za-z0-9.+-]+(?:\s+(?:AND|OR|WITH)\s+[A-Za-z0-9.+-]+)*$/.test(license) ? license : null;
}

export function declaredSpdxFromManifest(name, text) {
  const file = String(name ?? "").toLowerCase();
  const source = String(text ?? "");
  if (["package.json", "composer.json"].includes(file)) {
    try {
      const manifest = JSON.parse(source);
      const value = Array.isArray(manifest.license) ? manifest.license.join(" OR ") : manifest.license?.type ?? manifest.license;
      return plausibleSpdx(value);
    } catch {
      return null;
    }
  }
  if (["cargo.toml", "pyproject.toml", "setup.cfg"].includes(file)) {
    return plausibleSpdx(source.match(/^license\s*=\s*["']([^"']+)["']/im)?.[1]);
  }
  return null;
}
