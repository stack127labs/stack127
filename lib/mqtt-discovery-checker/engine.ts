export type MqttSeverity = "error" | "warning";
export type MqttFinding = Readonly<{
  code: string;
  severity: MqttSeverity;
  path: string;
  message: string;
}>;

export type MqttInput = Readonly<{
  topic: string;
  payload: string;
  prefix: string;
}>;

export type MqttValues = Readonly<{
  component: string;
  topicParts: string[];
  normalizedPayload: string;
  findings: MqttFinding[];
  errorCount: number;
  warningCount: number;
  profileVersion: "mqtt-discovery-v1";
}>;

export type MqttResult = Readonly<{
  status: "valid" | "partial" | "invalid";
  values: MqttValues | null;
  issues: MqttFinding[];
}>;

export const DEFAULT_MQTT_INPUT: MqttInput = {
  topic: "homeassistant/sensor/lab/temperature/config",
  payload: JSON.stringify({ name: "Temperature", unique_id: "lab-temperature", state_topic: "lab/temperature/state" }, null, 2),
  prefix: "homeassistant",
};

const components = new Set([
  "alarm_control_panel", "binary_sensor", "button", "camera", "climate", "cover", "device_tracker", "fan", "humidifier", "light", "lock", "media_player", "number", "select", "sensor", "siren", "switch", "text", "update", "vacuum", "valve", "water_heater",
]);

function objectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finding(code: string, severity: MqttSeverity, path: string, message: string): MqttFinding {
  return { code, severity, path, message };
}

function topicFindings(topic: string, prefix: string) {
  const findings: MqttFinding[] = [];
  const parts = topic.split("/");
  if (!topic.trim()) return [finding("topic.empty", "error", "topic", "Add a discovery topic.")];
  if (!prefix.trim()) findings.push(finding("prefix.empty", "error", "prefix", "Add a discovery prefix."));
  else if (prefix.includes("/")) findings.push(finding("prefix.segment", "error", "prefix", "Prefix must be one topic segment."));
  if (parts[0] !== prefix) findings.push(finding("topic.prefix", "error", "topic", `Topic must start with ${prefix}.`));
  if (parts.at(-1) !== "config") findings.push(finding("topic.suffix", "error", "topic", "Topic must end with config."));
  if (parts.length !== 4 && parts.length !== 5) findings.push(finding("topic.segments", "error", "topic", "Use prefix, component, object, and config segments."));
  const component = parts[1] ?? "";
  if (!components.has(component)) findings.push(finding("topic.component", "error", "topic[1]", `Component ${component || "(empty)"} is not in the v1 profile.`));
  const objectId = parts.length === 5 ? parts[3] : parts[2];
  if (!objectId) findings.push(finding("topic.object", "error", "topic", "Add an object id before config."));
  const idPattern = /^[A-Za-z0-9_-]+$/;
  const nodeId = parts.length === 5 ? parts[2] : null;
  if (nodeId !== null && !idPattern.test(nodeId)) findings.push(finding("topic.id", "error", "topic", "Node ID may use letters, numbers, underscores, and hyphens."));
  if (objectId && !idPattern.test(objectId)) findings.push(finding("topic.id", "error", "topic", "Object ID may use letters, numbers, underscores, and hyphens."));
  return findings;
}

function firstValue(payload: Record<string, unknown>, names: string[]) {
  for (const name of names) if (payload[name] !== undefined) return payload[name];
  return undefined;
}

function unsafeIntegerFinding(source: string): MqttFinding | null {
  let inString = false;
  let escaped = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char !== "-" && !/\d/.test(char)) continue;
    const match = source.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (!match) continue;
    const token = match[0];
    if (!/[.eE]/.test(token)) {
      try {
        const value = BigInt(token);
        if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
          return finding("json.number", "error", "payload", "JSON integer exceeds the exact JavaScript range.");
        }
      } catch {
        return finding("json.number", "error", "payload", "JSON integer cannot be checked exactly.");
      }
    }
    index += token.length - 1;
  }
  return null;
}

function payloadFindings(payload: unknown, component: string): MqttFinding[] {
  const findings: MqttFinding[] = [];
  if (!objectLike(payload)) return [finding("payload.object", "error", "$", "Payload must be a JSON object.")];
  const nameValue = firstValue(payload, ["name"]);
  const uniqueValue = firstValue(payload, ["unique_id", "uniq_id"]);
  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const uniqueId = typeof uniqueValue === "string" ? uniqueValue.trim() : "";
  if (nameValue !== undefined && nameValue !== null && typeof nameValue !== "string") findings.push(finding("payload.name", "error", "name", "Name must be text or null."));
  if (uniqueValue !== undefined && typeof uniqueValue !== "string") findings.push(finding("payload.unique_id", "error", "unique_id", "Unique ID must be text."));
  if (!name && !uniqueId) findings.push(finding("payload.identity", "warning", "name", "Add name or unique_id for a stable entity label."));
  const stateTopic = firstValue(payload, ["state_topic", "stat_t"]);
  const commandTopic = firstValue(payload, ["command_topic", "cmd_t"]);
  if ((component === "sensor" || component === "binary_sensor") && (typeof stateTopic !== "string" || !stateTopic.trim())) {
    findings.push(finding("profile.state_topic", "error", "state_topic", `${component} needs state_topic or stat_t.`));
  }
  if (component === "button" && (typeof commandTopic !== "string" || !commandTopic.trim())) {
    findings.push(finding("profile.command_topic", "error", "command_topic", "button needs command_topic or cmd_t."));
  }
  if (!new Set(["sensor", "binary_sensor", "button"]).has(component)) {
    findings.push(finding("profile.unchecked", "warning", "$", `${component} has only common fields checked by this profile.`));
  }
  const qos = firstValue(payload, ["qos"]);
  if (qos !== undefined && (!Number.isInteger(qos) || Number(qos) < 0 || Number(qos) > 2)) {
    findings.push(finding("payload.qos", "error", "qos", "QoS must be 0, 1, or 2."));
  }
  const deviceValue = firstValue(payload, ["device", "dev"]);
  if (deviceValue !== undefined && !objectLike(deviceValue)) findings.push(finding("device.object", "error", "device", "Device must be a JSON object."));
  if (objectLike(deviceValue)) {
    const device = deviceValue;
    const hasName = typeof device.name === "string" && device.name.trim() !== "";
    const identifiers = firstValue(device, ["identifiers", "ids"]);
    const connections = firstValue(device, ["connections", "cns"]);
    const hasIdentifier = (typeof identifiers === "string" && identifiers.trim() !== "")
      || (Array.isArray(identifiers) && identifiers.some((item) => typeof item === "string" && item.trim() !== ""));
    const hasConnection = Array.isArray(connections) && connections.length > 0;
    if (!hasName) findings.push(finding("device.name", "warning", "device.name", "Add a device name when using device metadata."));
    if (!hasIdentifier && !hasConnection) findings.push(finding("device.identity", "warning", "device", "Add identifiers or connections to group this device."));
  }
  if (payload.availability !== undefined && !Array.isArray(payload.availability) && !objectLike(payload.availability)) findings.push(finding("availability.shape", "warning", "availability", "Availability should be an object or array."));
  return findings;
}

export function checkMqttDiscovery(input: unknown): MqttResult {
  if (!objectLike(input)) {
    const issue = finding("input.object", "error", "$", "Input must be an object.");
    return { status: "invalid", values: null, issues: [issue] };
  }
  const topic = typeof input.topic === "string" ? input.topic.trim() : "";
  const prefix = typeof input.prefix === "string" ? input.prefix.trim() : "";
  const topicIssues = topicFindings(topic, prefix);
  let parsed: unknown = null;
  const issues: MqttFinding[] = [...topicIssues];
  if (typeof input.payload !== "string") issues.push(finding("json.type", "error", "payload", "Payload must be JSON text."));
  else if (!input.payload.trim()) issues.push(finding("json.empty", "error", "payload", "Add a JSON payload."));
  else {
    try {
      const unsafe = unsafeIntegerFinding(input.payload);
      if (unsafe) issues.push(unsafe);
      parsed = JSON.parse(input.payload);
    } catch {
      issues.push(finding("json.parse", "error", "$", "Payload is not valid JSON."));
    }
  }
  const parts = topic.split("/");
  const component = parts[1] ?? "unknown";
  if (typeof input.payload === "string" && input.payload.trim() && !issues.some((issue) => issue.code === "json.parse")) issues.push(...payloadFindings(parsed, component));
  const errorCount = issues.filter((item) => item.severity === "error").length;
  const warningCount = issues.filter((item) => item.severity === "warning").length;
  if (errorCount) return { status: "invalid", values: null, issues };
  const values: MqttValues = {
    component,
    topicParts: parts,
    normalizedPayload: JSON.stringify(parsed, null, 2),
    findings: issues,
    errorCount,
    warningCount,
    profileVersion: "mqtt-discovery-v1",
  };
  return { status: warningCount ? "partial" : "valid", values, issues };
}

export function formatMqttReport(result: MqttResult) {
  if (!result.values) return result.issues.map((issue) => `${issue.severity.toUpperCase()} ${issue.path}: ${issue.message}`).join("\n");
  return [
    `${result.status.toUpperCase()} ${result.values.component}: ${result.values.errorCount} errors, ${result.values.warningCount} warnings`,
    ...result.values.findings.map((issue) => `${issue.severity.toUpperCase()} ${issue.path}: ${issue.message}`),
    result.values.normalizedPayload,
  ].join("\n");
}
