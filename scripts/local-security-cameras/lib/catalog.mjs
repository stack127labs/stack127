function clean(value) {
  return String(value ?? "").replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, ",").replace(/\s+/g, " ").trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function label(value, fallback = "Not published") {
  const text = clean(value);
  return text ? text.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase()) : fallback;
}

function fact(name, value) {
  return value !== null && value !== undefined && value !== "" ? { label: name, value: clean(value) } : null;
}

function resolution(camera) {
  if (camera.resolution?.label) return camera.resolution.label;
  if (camera.resolution?.max_width && camera.resolution?.max_height) return `${camera.resolution.max_width}x${camera.resolution.max_height}`;
  if (camera.resolution?.megapixels) return `${camera.resolution.megapixels}MP`;
  return "Resolution not published";
}

function power(camera) {
  if (camera.power?.method) return clean(camera.power.method);
  const values = (camera.power_source ?? []).map((value) => value.toLowerCase() === "poe" ? "PoE" : label(value));
  return values.length > 0 ? values.join(" + ") : "Power method not published";
}

export function isLocalCamera(camera) {
  return (camera.protocols ?? []).some((protocol) => ["onvif", "rtsp"].includes(String(protocol).toLowerCase()));
}

export function buildCameraRecord(camera, options = {}) {
  const protocols = unique((camera.protocols ?? []).map((value) => String(value).toUpperCase()));
  const localProtocols = protocols.filter((protocol) => ["ONVIF", "RTSP"].includes(protocol));
  const frigate = camera.configs?.frigate;
  const resolutionValue = resolution(camera);
  const powerValue = power(camera);
  const type = label(camera.type, "Camera");
  const identityFacts = [
    fact("Brand", camera.brand),
    fact("Model", camera.model),
    fact("Body type", type),
    fact("Status", label(camera.status, "Current status not published")),
    fact("Markets", (camera.markets ?? []).join(", ")),
    fact("Last verified", camera.last_verified),
  ].filter(Boolean);
  const videoFacts = [
    fact("Resolution", resolutionValue),
    fact("Video protocols", protocols.join(", ")),
    fact("Codecs", (camera.video?.codecs ?? []).join(", ")),
    fact("Maximum frame rate", camera.video?.max_fps ? `${camera.video.max_fps} fps` : ""),
    fact("Sensor", camera.sensor),
    fact("Field of view", camera.field_of_view_deg),
    fact("Night vision", camera.night_vision?.type ? `${label(camera.night_vision.type)}${camera.night_vision.range_m ? `, ${camera.night_vision.range_m} m` : ""}` : ""),
  ].filter(Boolean);
  const streamFacts = [
    fact("RTSP main stream", frigate?.rtsp_url_template),
    fact("Best substream", frigate?.best_substream),
    fact("ONVIF port", frigate?.onvif_port),
    ...(camera.video?.streams ?? []).map((stream) => fact(`Published ${stream.name ?? "video"} stream`, [stream.resolution, stream.fps ? `${stream.fps} fps` : "", stream.codec].filter(Boolean).join(", "))).filter(Boolean),
  ].filter(Boolean);
  if (streamFacts.length === 0) streamFacts.push({ label: "Stream discovery", value: localProtocols.includes("ONVIF") ? "Use ONVIF discovery; the source does not publish an RTSP path" : "RTSP is reported; the exact path is not published" });
  const installationFacts = [
    fact("Power", powerValue),
    fact("Connectivity", (camera.connectivity ?? []).map((value) => label(value)).join(", ")),
    fact("Weather rating", camera.ip_rating),
    fact("Impact rating", camera.ik_rating),
    fact("Environment", (camera.environment ?? []).map((value) => label(value)).join(", ")),
    fact("Dimensions", camera.dimensions_mm ? `${camera.dimensions_mm} mm` : ""),
    fact("Weight", camera.weight_g ? `${camera.weight_g} g` : ""),
    fact("Operating temperature", camera.operating_temp_c ? `${camera.operating_temp_c} °C` : ""),
    fact("Onboard storage", camera.storage?.onboard === true ? "Yes" : camera.storage?.onboard === false ? "No" : ""),
    fact("Maximum microSD", camera.storage?.max_microsd_gb ? `${camera.storage.max_microsd_gb} GB` : ""),
  ].filter(Boolean);
  const integrationFacts = [
    fact("Frigate configuration", frigate?.verified === true ? "Verified" : frigate ? "Recorded, not bench verified" : "Not recorded"),
    fact("Frigate stream method", frigate?.recommended_stream_type),
    fact("Frigate notes", frigate?.notes),
    fact("Home Assistant integration", camera.configs?.home_assistant?.integration),
    fact("Home Assistant notes", camera.configs?.home_assistant?.notes),
    fact("Blue Iris profile", camera.configs?.blue_iris?.profile),
  ].filter(Boolean);
  const facts = [...identityFacts, ...videoFacts, ...streamFacts, ...installationFacts, ...integrationFacts];
  const sourceUrl = `https://github.com/ch-bas/cctv-camera-database/blob/${options.commit}/data/cameras.json`;

  return {
    added: camera.added ?? null,
    card: {
      compatibility: { label: "Local video", status: "confirmed", value: localProtocols.join(" + ") },
      facts: [
        { label: "Resolution", value: resolutionValue },
        { label: "Power", value: powerValue },
      ],
    },
    category: type,
    detail_sections: [
      { facts: identityFacts, heading: "Exact model" },
      { facts: videoFacts, heading: "Video and optics" },
      { facts: streamFacts, heading: "Local streams" },
      { facts: installationFacts, heading: "Installation" },
      { facts: integrationFacts, heading: "Frigate and integrations" },
    ],
    evidence: [
      { label: "Local video", value: localProtocols.join(" + ") },
      { label: "Frigate", value: frigate?.verified === true ? "Verified config" : frigate ? "Config recorded" : "No config recorded" },
    ],
    facts,
    features: unique([...protocols, ...(camera.connectivity ?? []).map((value) => label(value)), ...(camera.power_source ?? []).map((value) => value.toLowerCase() === "poe" ? "PoE" : label(value)), ...(frigate?.verified === true ? ["Verified Frigate config"] : []), ...(camera.audio?.two_way ? ["Two-way audio"] : [])]),
    image_path: options.imagePath ?? null,
    image_quality: options.imageQuality ?? null,
    image_source_url: options.imageSourceUrl ?? null,
    model: camera.model,
    name: `${camera.brand} ${camera.model}`,
    notes: unique([camera.release_notes, ...(camera.community_notes ?? []).map((item) => item.note)].map(clean)).slice(0, 3),
    provenance: facts.map((item) => ({ field: item.label, source: "CCTV Camera Database", url: sourceUrl })),
    search_terms: unique([camera.id, ...(camera.aliases ?? []), camera.brand, camera.model, type, resolutionValue, ...protocols, powerValue]),
    slug: options.slug,
    source_links: [
      { label: "CC0 camera record", url: sourceUrl },
      ...(camera.sources ?? []).map((url, index) => ({ label: `Evidence source ${index + 1}`, url })),
    ],
    stats: [
      { label: "resolution", value: resolutionValue },
      { label: "power", value: powerValue },
    ],
    vendor: camera.brand,
  };
}
