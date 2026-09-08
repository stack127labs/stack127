import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCameraRecord, isLocalCamera } from "../../../scripts/local-security-cameras/lib/catalog.mjs";

const camera = {
  brand: "Example",
  configs: { frigate: { best_substream: "rtsp://{user}:{pass}@{ip}:554/sub", onvif_port: 80, rtsp_url_template: "rtsp://{user}:{pass}@{ip}:554/main", verified: true } },
  connectivity: ["ethernet"],
  id: "example-cam-4k",
  model: "Cam 4K",
  power: { method: "PoE (802.3af)" },
  power_source: ["poe"],
  protocols: ["onvif", "rtsp"],
  resolution: { label: "8MP", max_height: 2160, max_width: 3840 },
  sources: ["https://example.com/cam-4k"],
  type: "bullet",
  video: { codecs: ["H.265", "H.264"], max_fps: 25 },
};

test("camera eligibility requires RTSP or ONVIF", () => {
  assert.equal(isLocalCamera(camera), true);
  assert.equal(isLocalCamera({ protocols: ["cloud"] }), false);
});

test("camera card answers local-video, resolution, and power questions", () => {
  const record = buildCameraRecord(camera, { commit: "a".repeat(40), slug: camera.id });
  assert.deepEqual(record.card, {
    compatibility: { label: "Local video", status: "confirmed", value: "ONVIF + RTSP" },
    facts: [
      { label: "Resolution", value: "8MP" },
      { label: "Power", value: "PoE (802.3af)" },
    ],
  });
  assert.equal(record.detail_sections.find((section) => section.heading === "Local streams").facts.length, 3);
});

test("camera without a published stream path gets an honest discovery instruction", () => {
  const record = buildCameraRecord({ ...camera, configs: {}, video: {} }, { commit: "a".repeat(40), slug: camera.id });
  assert.deepEqual(record.detail_sections.find((section) => section.heading === "Local streams").facts, [
    { label: "Stream discovery", value: "Use ONVIF discovery; the source does not publish an RTSP path" },
  ]);
});
