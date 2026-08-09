export const NFS_FIREWALL_FORMULA_VERSION = "nfs-firewall-plan-v1" as const;
export const NFS_FIREWALL_SOURCE_DATE = "2026-08-09" as const;

export const nfsVersions = ["v3", "v4_0", "v4_1_plus"] as const;
export const protectedHosts = ["server", "client"] as const;
export const firewallFamilies = ["firewalld", "ufw", "nftables"] as const;
export const addressFamilies = ["ipv4", "ipv6"] as const;
export const nfsTransports = ["tcp", "tcp_udp"] as const;

export type NfsVersion = (typeof nfsVersions)[number];
export type ProtectedHost = (typeof protectedHosts)[number];
export type FirewallFamily = (typeof firewallFamilies)[number];
export type AddressFamily = (typeof addressFamilies)[number];
export type NfsTransport = (typeof nfsTransports)[number];

export type NfsFirewallInput = Readonly<{
  nfsVersion: NfsVersion;
  protectedHost: ProtectedHost;
  firewallFamily: FirewallFamily;
  addressFamily: AddressFamily;
  peerCidr: string;
  transport: NfsTransport;
  firewalldZone: string;
  mountdPort: string;
  statdPort: string;
  lockdTcpPort: string;
  lockdUdpPort: string;
  includeRquotad: boolean;
  rquotadPort: string;
  v4CallbackPort: string;
}>;

export type NfsListenerRow = Readonly<{
  endpoint: ProtectedHost;
  direction: "inbound";
  peerCidr: string;
  service: "nfs" | "rpcbind" | "mountd" | "statd" | "lockd" | "rquotad" | "nfs4_callback";
  protocol: "tcp" | "udp";
  port: number;
  portSource: "protocol_fixed" | "user_verified";
  reason: string;
}>;

type InputField = keyof NfsFirewallInput | "form" | "ports";
type InvalidResult = Readonly<{
  status: "invalid";
  errors: Readonly<Partial<Record<InputField, string>>>;
  formulaVersion: typeof NFS_FIREWALL_FORMULA_VERSION;
}>;
type IncompleteResult = Readonly<{
  status: "incomplete";
  answer: string;
  peerCidr: string;
  rows: readonly NfsListenerRow[];
  missing: readonly (keyof NfsFirewallInput)[];
  warnings: readonly string[];
  formulaVersion: typeof NFS_FIREWALL_FORMULA_VERSION;
}>;
type ReadyTranslation =
  | Readonly<{ status: "ready"; label: string; commands: readonly string[]; note: string }>
  | Readonly<{ status: "missing_context"; label: string; note: string }>;
type ReadyResult = Readonly<{
  status: "ready";
  answer: string;
  peerCidr: string;
  rows: readonly NfsListenerRow[];
  boundaries: readonly string[];
  warnings: readonly string[];
  translation: ReadyTranslation;
  verification: readonly string[];
  formulaVersion: typeof NFS_FIREWALL_FORMULA_VERSION;
  copyText?: string;
}>;
type NoRuleResult = Readonly<{
  status: "no_additional_rule";
  answer: string;
  peerCidr: string;
  warnings: readonly string[];
  verification: readonly string[];
  formulaVersion: typeof NFS_FIREWALL_FORMULA_VERSION;
}>;
export type NfsFirewallResult = InvalidResult | IncompleteResult | ReadyResult | NoRuleResult;

const inputKeys = Object.freeze([
  "nfsVersion", "protectedHost", "firewallFamily", "addressFamily", "peerCidr", "transport",
  "firewalldZone", "mountdPort", "statdPort", "lockdTcpPort", "lockdUdpPort", "includeRquotad",
  "rquotadPort", "v4CallbackPort",
] as const);
const versionSet = new Set<string>(nfsVersions);
const protectedHostSet = new Set<string>(protectedHosts);
const firewallSet = new Set<string>(firewallFamilies);
const addressSet = new Set<string>(addressFamilies);
const transportSet = new Set<string>(nfsTransports);

function invalid(errors: Partial<Record<InputField, string>>): InvalidResult {
  return Object.freeze({ status: "invalid", errors: Object.freeze({ ...errors }), formulaVersion: NFS_FIREWALL_FORMULA_VERSION });
}

function isPlainInput(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function normalizeInput(value: unknown): NfsFirewallInput | InvalidResult {
  if (!isPlainInput(value)) return invalid({ form: "Enter one valid planner configuration." });
  const keys = Object.keys(value);
  if (keys.length !== inputKeys.length || !inputKeys.every((key) => Object.prototype.hasOwnProperty.call(value, key))) {
    return invalid({ form: "Planner fields are missing or unknown fields were supplied." });
  }
  if (typeof value.nfsVersion !== "string" || !versionSet.has(value.nfsVersion)) return invalid({ nfsVersion: "Choose a supported NFS version." });
  if (typeof value.protectedHost !== "string" || !protectedHostSet.has(value.protectedHost)) return invalid({ protectedHost: "Choose the protected host." });
  if (typeof value.firewallFamily !== "string" || !firewallSet.has(value.firewallFamily)) return invalid({ firewallFamily: "Choose a supported firewall." });
  if (typeof value.addressFamily !== "string" || !addressSet.has(value.addressFamily)) return invalid({ addressFamily: "Choose IPv4 or IPv6." });
  if (typeof value.transport !== "string" || !transportSet.has(value.transport)) return invalid({ transport: "Choose a supported NFSv3 transport." });
  if (typeof value.includeRquotad !== "boolean") return invalid({ includeRquotad: "Choose whether remote quota is required." });
  for (const key of ["peerCidr", "firewalldZone", "mountdPort", "statdPort", "lockdTcpPort", "lockdUdpPort", "rquotadPort", "v4CallbackPort"] as const) {
    if (typeof value[key] !== "string" || value[key].length > 256) return invalid({ [key]: "Enter a valid text value." });
  }
  return Object.freeze({
    nfsVersion: value.nfsVersion as NfsVersion,
    protectedHost: value.protectedHost as ProtectedHost,
    firewallFamily: value.firewallFamily as FirewallFamily,
    addressFamily: value.addressFamily as AddressFamily,
    peerCidr: (value.peerCidr as string).trim(),
    transport: value.transport as NfsTransport,
    firewalldZone: (value.firewalldZone as string).trim(),
    mountdPort: (value.mountdPort as string).trim(),
    statdPort: (value.statdPort as string).trim(),
    lockdTcpPort: (value.lockdTcpPort as string).trim(),
    lockdUdpPort: (value.lockdUdpPort as string).trim(),
    includeRquotad: value.includeRquotad,
    rquotadPort: (value.rquotadPort as string).trim(),
    v4CallbackPort: (value.v4CallbackPort as string).trim(),
  });
}

function parseIpv4Address(value: string): boolean {
  const parts = value.split(".");
  return parts.length === 4 && parts.every((part) => /^(?:0|[1-9]\d{0,2})$/.test(part) && Number(part) <= 255);
}

function parseIpv6Address(value: string): boolean {
  if (!value || /[%\[\]\s]/.test(value)) return false;
  let candidate = value;
  if (candidate.includes(".")) {
    const lastColon = candidate.lastIndexOf(":");
    if (lastColon < 0) return false;
    const ipv4 = candidate.slice(lastColon + 1);
    if (!parseIpv4Address(ipv4)) return false;
    const octets = ipv4.split(".").map(Number);
    candidate = `${candidate.slice(0, lastColon + 1)}${((octets[0] << 8) | octets[1]).toString(16)}:${((octets[2] << 8) | octets[3]).toString(16)}`;
  }
  if (!/^[0-9a-f:]+$/i.test(candidate) || candidate.includes(":::")) return false;
  const compressed = candidate.includes("::");
  if (compressed && candidate.indexOf("::") !== candidate.lastIndexOf("::")) return false;
  const [leftText, rightText = ""] = compressed ? candidate.split("::") : [candidate, ""];
  const left = leftText ? leftText.split(":") : [];
  const right = rightText ? rightText.split(":") : [];
  const groups = [...left, ...right];
  if (groups.some((part) => !/^[0-9a-f]{1,4}$/i.test(part))) return false;
  return compressed ? groups.length < 8 : groups.length === 8;
}

function validateCidr(family: AddressFamily, value: string): { normalized?: string; prefix?: number; error?: string } {
  const pieces = value.split("/");
  if (pieces.length !== 2 || !/^\d+$/.test(pieces[1])) return { error: `Enter an ${family === "ipv4" ? "IPv4" : "IPv6"} CIDR with a prefix.` };
  const prefix = Number(pieces[1]);
  const valid = family === "ipv4"
    ? prefix <= 32 && parseIpv4Address(pieces[0])
    : prefix <= 128 && parseIpv6Address(pieces[0]);
  if (!valid) return { error: `Enter a valid ${family === "ipv4" ? "IPv4" : "IPv6"} CIDR.` };
  return { normalized: family === "ipv6" ? value.toLowerCase() : value, prefix };
}

function parsePort(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const port = Number(value);
  return port >= 1 && port <= 65535 ? port : null;
}

type DraftRow = NfsListenerRow & { sourceField?: keyof NfsFirewallInput };

function row(input: NfsFirewallInput, service: NfsListenerRow["service"], protocol: "tcp" | "udp", port: number, fixed: boolean, reason: string, sourceField?: keyof NfsFirewallInput): DraftRow {
  return Object.freeze({
    endpoint: input.protectedHost,
    direction: "inbound",
    peerCidr: input.peerCidr,
    service,
    protocol,
    port,
    portSource: fixed ? "protocol_fixed" : "user_verified",
    reason,
    ...(sourceField ? { sourceField } : {}),
  });
}

function sortRows(rows: readonly DraftRow[]): readonly DraftRow[] {
  return Object.freeze([...rows].sort((a, b) =>
    a.endpoint.localeCompare(b.endpoint)
    || (a.protocol === b.protocol ? 0 : a.protocol === "tcp" ? -1 : 1)
    || a.port - b.port
    || a.service.localeCompare(b.service)));
}

function addVerified(
  input: NfsFirewallInput,
  rows: DraftRow[],
  missing: (keyof NfsFirewallInput)[],
  errors: Partial<Record<InputField, string>>,
  field: "mountdPort" | "statdPort" | "lockdTcpPort" | "lockdUdpPort" | "rquotadPort" | "v4CallbackPort",
  service: NfsListenerRow["service"],
  protocol: "tcp" | "udp",
  reason: string,
) {
  const value = input[field];
  if (!value) {
    missing.push(field);
    return;
  }
  const port = parsePort(value);
  if (port === null) {
    errors[field] = "Enter a decimal port from 1 to 65535.";
    return;
  }
  rows.push(row(input, service, protocol, port, false, reason, field));
}

function resolveRows(input: NfsFirewallInput) {
  const rows: DraftRow[] = [];
  const missing: (keyof NfsFirewallInput)[] = [];
  const errors: Partial<Record<InputField, string>> = {};
  const boundaries: string[] = [];
  if (input.nfsVersion === "v4_1_plus") {
    if (input.protectedHost === "server") rows.push(row(input, "nfs", "tcp", 2049, true, "NFSv4.1 and later use the registered NFS listener."));
    return { rows: sortRows(rows), missing, errors, boundaries };
  }
  if (input.nfsVersion === "v4_0") {
    if (input.protectedHost === "server") {
      rows.push(row(input, "nfs", "tcp", 2049, true, "NFSv4.0 clients connect to the registered NFS listener."));
      boundaries.push("NFSv4.0 client callbacks are a separate inbound rule on the client host.");
    } else {
      addVerified(input, rows, missing, errors, "v4CallbackPort", "nfs4_callback", "tcp", "The NFSv4.0 client callback listener must be configured and verified locally.");
    }
    return { rows: sortRows(rows), missing, errors, boundaries };
  }
  if (input.protectedHost === "server") {
    rows.push(row(input, "rpcbind", "tcp", 111, true, "NFSv3 clients discover RPC services through rpcbind."));
    rows.push(row(input, "nfs", "tcp", 2049, true, "NFS traffic reaches the registered NFS listener."));
    addVerified(input, rows, missing, errors, "mountdPort", "mountd", "tcp", "mountd handles NFSv3 mount requests on a locally verified port.");
  } else {
    rows.push(row(input, "rpcbind", "tcp", 111, true, "The NFSv3 server reaches the client rpcbind listener for callback services."));
  }
  addVerified(input, rows, missing, errors, "statdPort", "statd", "tcp", "statd coordinates NFSv3 lock recovery on a locally verified port.");
  addVerified(input, rows, missing, errors, "lockdTcpPort", "lockd", "tcp", "lockd handles NFSv3 locking on a locally verified TCP port.");
  if (input.protectedHost === "server" && input.includeRquotad) addVerified(input, rows, missing, errors, "rquotadPort", "rquotad", "tcp", "rquotad is included only when remote quota is enabled and verified.");
  if (input.transport === "tcp_udp") {
    if (input.protectedHost === "server") {
      rows.push(row(input, "rpcbind", "udp", 111, true, "Legacy UDP clients discover RPC services through rpcbind."));
      rows.push(row(input, "nfs", "udp", 2049, true, "Legacy NFSv3 UDP traffic reaches the registered NFS listener."));
      addVerified(input, rows, missing, errors, "mountdPort", "mountd", "udp", "mountd uses the locally verified port over explicitly selected UDP.");
    } else {
      rows.push(row(input, "rpcbind", "udp", 111, true, "The NFSv3 server reaches the client rpcbind listener over explicitly selected UDP."));
    }
    addVerified(input, rows, missing, errors, "statdPort", "statd", "udp", "statd uses the locally verified port over explicitly selected UDP.");
    addVerified(input, rows, missing, errors, "lockdUdpPort", "lockd", "udp", "lockd uses its separately verified UDP port.");
    if (input.protectedHost === "server" && input.includeRquotad) addVerified(input, rows, missing, errors, "rquotadPort", "rquotad", "udp", "rquotad uses the locally verified port over explicitly selected UDP.");
  }
  return { rows: sortRows(rows), missing: [...new Set(missing)], errors, boundaries };
}

function collisionErrors(rows: readonly DraftRow[]): Partial<Record<InputField, string>> {
  const seen = new Map<string, DraftRow>();
  const errors: Partial<Record<InputField, string>> = {};
  for (const current of rows) {
    const key = `${current.protocol}:${current.port}`;
    const previous = seen.get(key);
    if (previous && previous.service !== current.service) {
      const message = `${previous.service} and ${current.service} cannot share ${current.protocol.toUpperCase()} port ${current.port}; this is a listener collision.`;
      errors[previous.sourceField ?? "ports"] = message;
      errors[current.sourceField ?? "ports"] = message;
    } else seen.set(key, current);
  }
  return errors;
}

function translation(input: NfsFirewallInput, rows: readonly NfsListenerRow[]): ReadyTranslation {
  if (input.firewallFamily === "firewalld") {
    if (!input.firewalldZone) return Object.freeze({ status: "missing_context", label: "firewalld review commands", note: "Enter the active firewalld zone to create review commands." });
    return Object.freeze({
      status: "ready",
      label: "firewalld review commands",
      commands: Object.freeze(rows.map((current) => `firewall-cmd --permanent --zone=${input.firewalldZone} --add-rich-rule='rule family="${input.addressFamily}" source address="${input.peerCidr}" port port="${current.port}" protocol="${current.protocol}" accept'`)),
      note: "Review the zone binding and existing rules before applying these permanent rich rules.",
    });
  }
  if (input.firewallFamily === "ufw") {
    return Object.freeze({
      status: "ready",
      label: "UFW review commands",
      commands: Object.freeze(rows.map((current) => `ufw allow in proto ${current.protocol} from ${input.peerCidr} to any port ${current.port} comment 'NFS ${current.service}'`)),
      note: input.addressFamily === "ipv6" ? "Confirm IPv6 is enabled in UFW before reviewing these rules." : "Review rule order and the active UFW policy before applying these commands.",
    });
  }
  const selector = input.addressFamily === "ipv4" ? "ip saddr" : "ip6 saddr";
  const commands = (["tcp", "udp"] as const).flatMap((protocol) => {
    const ports = rows.filter((current) => current.protocol === protocol).map((current) => current.port);
    if (ports.length === 0) return [];
    const destination = ports.length === 1 ? String(ports[0]) : `{ ${ports.join(", ")} }`;
    return [`${selector} ${input.peerCidr} ${protocol} dport ${destination} accept`];
  });
  return Object.freeze({ status: "ready", label: "nftables review expressions", commands: Object.freeze(commands), note: "Insert these expressions only into an existing inet input chain after reviewing its order and policy." });
}

function verification(input: NfsFirewallInput): readonly string[] {
  const version = input.nfsVersion === "v3" ? "3" : input.nfsVersion === "v4_0" ? "4.0" : "4.1";
  const transport = input.nfsVersion === "v3" ? ",proto=tcp" : "";
  const firewallCheck = input.firewallFamily === "firewalld"
    ? input.firewalldZone ? `firewall-cmd --zone=${input.firewalldZone} --list-all` : "firewall-cmd --get-active-zones"
    : input.firewallFamily === "ufw" ? "ufw status verbose" : "nft list ruleset";
  return Object.freeze([
    ...(input.nfsVersion === "v3" ? ["Confirm the locally assigned RPC ports with rpcinfo -p."] : []),
    "Confirm the modeled listeners on the protected host with ss -lntup.",
    `Inspect the active firewall before changing it with ${firewallCheck}.`,
    `Test the mount from the NFS client with mount -t nfs -o vers=${version}${transport} <server>:/export <mountpoint>.`,
    "Confirm the negotiated version and transport with findmnt -o TARGET,FSTYPE,OPTIONS <mountpoint>.",
    "Treat access denied as an export or permission problem, not proof of a missing firewall port.",
  ]);
}

function copyText(result: Omit<ReadyResult, "copyText">): string {
  const translationLines = result.translation.status === "ready" ? result.translation.commands : [];
  return [
    `formula\t${NFS_FIREWALL_FORMULA_VERSION}`,
    `source date\t${NFS_FIREWALL_SOURCE_DATE}`,
    `answer\t${result.answer}`,
    "service\tdirection\tpeer source\tprotocol\tport\tport source",
    ...result.rows.map((current) => `${current.service}\t${current.direction}\t${current.peerCidr}\t${current.protocol}\t${current.port}\t${current.portSource.replace("_", " ")}`),
    "",
    result.translation.label,
    ...translationLines,
    "",
    "verification",
    ...result.verification.map((step, index) => `${index + 1}. ${step}`),
  ].join("\n");
}

export function buildNfsFirewallPlan(value: unknown): NfsFirewallResult {
  const normalized = normalizeInput(value);
  if ("status" in normalized) return normalized;
  const input = normalized;
  const cidr = validateCidr(input.addressFamily, input.peerCidr);
  const validationErrors: Partial<Record<InputField, string>> = {};
  if (cidr.error) validationErrors.peerCidr = cidr.error;
  if (input.firewallFamily === "firewalld" && input.firewalldZone && !/^[A-Za-z0-9_-]{1,32}$/.test(input.firewalldZone)) {
    validationErrors.firewalldZone = "Use 1 to 32 ASCII letters, digits, underscores, or hyphens.";
  }
  if (Object.keys(validationErrors).length > 0) return invalid(validationErrors);
  const resolvedInput = Object.freeze({ ...input, peerCidr: cidr.normalized as string });
  const warnings = Object.freeze(cidr.prefix === 0 ? [`This /0 source allows every ${input.addressFamily === "ipv4" ? "IPv4" : "IPv6"} source address.`] : []);
  if (input.nfsVersion === "v4_1_plus" && input.protectedHost === "client") {
    return Object.freeze({
      status: "no_additional_rule",
      answer: "No new inbound callback listener is needed on this NFS client for v4.1 or later.",
      peerCidr: resolvedInput.peerCidr,
      warnings,
      verification: Object.freeze([
        "NFSv4.1 callbacks use the client-established session connection on a stateful host firewall.",
        "Confirm there is no unexpected listener with ss -lntup.",
        `Inspect the active firewall with ${input.firewallFamily === "firewalld" ? "firewall-cmd --get-active-zones" : input.firewallFamily === "ufw" ? "ufw status verbose" : "nft list ruleset"}.`,
        "Test the mount from the NFS client with mount -t nfs -o vers=4.1 <server>:/export <mountpoint>.",
        "Confirm a real mount uses vers=4.1 with findmnt -o TARGET,FSTYPE,OPTIONS <mountpoint>.",
      ]),
      formulaVersion: NFS_FIREWALL_FORMULA_VERSION,
    });
  }
  const resolved = resolveRows(resolvedInput);
  if (Object.keys(resolved.errors).length > 0) return invalid(resolved.errors);
  const collisions = collisionErrors(resolved.rows);
  if (Object.keys(collisions).length > 0) return invalid(collisions);
  if (resolved.missing.length > 0) {
    const labels: Record<string, string> = { mountdPort: "mountd", statdPort: "statd", lockdTcpPort: "lockd TCP", lockdUdpPort: "lockd UDP", rquotadPort: "rquotad", v4CallbackPort: "NFSv4.0 callback" };
    return Object.freeze({
      status: "incomplete",
      answer: `${input.nfsVersion === "v3" ? "The NFSv3 plan" : "The NFSv4.0 client plan"} is incomplete until ${resolved.missing.map((field) => labels[field]).join(", ")} ${resolved.missing.length === 1 ? "port is" : "ports are"} verified.`,
      peerCidr: resolvedInput.peerCidr,
      rows: Object.freeze(resolved.rows.filter((current) => current.portSource === "protocol_fixed").map(({ sourceField: _sourceField, ...current }) => Object.freeze(current))),
      missing: Object.freeze(resolved.missing),
      warnings,
      formulaVersion: NFS_FIREWALL_FORMULA_VERSION,
    });
  }
  const publicRows = Object.freeze(resolved.rows.map(({ sourceField: _sourceField, ...current }) => Object.freeze(current)));
  const resultTranslation = translation(resolvedInput, publicRows);
  const resultVerification = verification(resolvedInput);
  const resultWithoutCopy: Omit<ReadyResult, "copyText"> = Object.freeze({
    status: "ready",
    answer: `Allow ${publicRows.length} listener ${publicRows.length === 1 ? "rule" : "rules"} on the NFS ${input.protectedHost}.`,
    peerCidr: resolvedInput.peerCidr,
    rows: publicRows,
    boundaries: Object.freeze(resolved.boundaries),
    warnings,
    translation: resultTranslation,
    verification: resultVerification,
    formulaVersion: NFS_FIREWALL_FORMULA_VERSION,
  });
  if (resultTranslation.status !== "ready") return resultWithoutCopy;
  return Object.freeze({ ...resultWithoutCopy, copyText: copyText(resultWithoutCopy) });
}
