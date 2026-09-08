import assert from "node:assert/strict";
import { test } from "node:test";
import { extractExactModelImageCandidates, extractProductImageCandidates } from "../../../scripts/local-security-cameras/lib/image-candidates.mjs";

test("extracts social images and matching Product JSON-LD images", () => {
  const html = `
    <meta property="og:image" content="/social.jpg">
    <script type="application/ld+json">{
      "@type":"Product",
      "model":"RLC-823A",
      "image":["/front.png",{"contentUrl":"https://cdn.example/rear.webp"}]
    }</script>`;
  assert.deepEqual(extractProductImageCandidates(html, "https://example.com/camera", "RLC-823A"), [
    "https://example.com/social.jpg",
    "https://example.com/front.png",
    "https://cdn.example/rear.webp",
  ]);
});

test("extracts only image tags tied to the exact camera model", () => {
  const html = `
    <img alt="Dahua IPC-HFW2831T-AS-S2 camera" data-src="/media/IPC-HFW2831T-AS-S2-front.png">
    <img alt="Dahua logo" src="/media/logo.png">
    <img alt="IPC-HFW2831T-AS-S3" src="/media/other.jpg">`;
  assert.deepEqual(extractExactModelImageCandidates(html, "https://example.com/product", "IPC-HFW2831T-AS-S2"), [
    "https://example.com/media/IPC-HFW2831T-AS-S2-front.png",
  ]);
});

test("rejects JSON-LD product images for a different model", () => {
  const html = '<script type="application/ld+json">{"@type":"Product","model":"OTHER","image":"/other.jpg"}</script>';
  assert.deepEqual(extractProductImageCandidates(html, "https://example.com/camera", "CX410"), []);
});
