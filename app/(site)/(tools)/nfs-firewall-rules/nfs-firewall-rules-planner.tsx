"use client";

import { RotateCcw } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { ToolActionRow, ToolButton, ToolCheckbox, ToolChoiceGroup, ToolCodeOutput, ToolCopyAction, ToolResultLead, ToolStatus, ToolTextField, toolOption } from "@/app/tool-ui/tool-controls";
import { NFS_FIREWALL_FORMULA_VERSION, NFS_FIREWALL_SOURCE_DATE, type AddressFamily, type FirewallFamily, type NfsFirewallInput, type NfsFirewallResult, type NfsListenerRow, type NfsTransport, type NfsVersion, type ProtectedHost, buildNfsFirewallPlan } from "@/lib/nfs-firewall/plan";
import styles from "./nfs-firewall-rules.module.css";

const defaults: NfsFirewallInput = {
  nfsVersion: "v4_1_plus", protectedHost: "server", firewallFamily: "firewalld", addressFamily: "ipv4", peerCidr: "192.0.2.0/24", transport: "tcp", firewalldZone: "", mountdPort: "", statdPort: "", lockdTcpPort: "", lockdUdpPort: "", includeRquotad: false, rquotadPort: "", v4CallbackPort: "",
};
const options = {
  nfsVersion: [toolOption("v3", "NFSv3"), toolOption("v4_0", "NFSv4.0"), toolOption("v4_1_plus", "NFSv4.1+")],
  protectedHost: [toolOption("server", "NFS server"), toolOption("client", "NFS client")],
  firewallFamily: [toolOption("firewalld", "firewalld"), toolOption("ufw", "UFW"), toolOption("nftables", "nftables")],
  addressFamily: [toolOption("ipv4", "IPv4"), toolOption("ipv6", "IPv6")],
  transport: [toolOption("tcp", "TCP only"), toolOption("tcp_udp", "TCP + legacy UDP")],
};
const missingIds: Partial<Record<keyof NfsFirewallInput, string>> = { mountdPort: "nfs-mountd-port", statdPort: "nfs-statd-port", lockdTcpPort: "nfs-lockd-tcp-port", lockdUdpPort: "nfs-lockd-udp-port", rquotadPort: "nfs-rquotad-port", v4CallbackPort: "nfs-v4-callback-port" };
const missingLabels: Partial<Record<keyof NfsFirewallInput, string>> = { mountdPort: "mountd port", statdPort: "statd port", lockdTcpPort: "lockd TCP port", lockdUdpPort: "lockd UDP port", rquotadPort: "rquotad port", v4CallbackPort: "NFSv4.0 callback TCP port" };

function ListenerTable({ rows }: { rows: readonly NfsListenerRow[] }) {
  if (!rows.length) return null;
  return <div className={styles.tableWrap} role="region" aria-label="Listener plan" tabIndex={0}><table className={styles.listenerTable}>
    <thead><tr><th>Service</th><th>Host</th><th>Direction</th><th>Peer</th><th>Protocol</th><th>Port</th><th>Source</th></tr></thead>
    <tbody>{rows.map((row) => <tr key={`${row.endpoint}-${row.protocol}-${row.port}-${row.service}`}>
      <td data-label="Service"><code>{row.service}</code><span className={styles.rowReason}>{row.reason}</span></td>
      <td data-label="Host">NFS {row.endpoint}</td><td data-label="Direction">{row.direction}</td><td data-label="Peer"><code>{row.peerCidr}</code></td>
      <td data-label="Protocol">{row.protocol.toUpperCase()}</td><td data-label="Port"><code>{row.port}</code></td><td data-label="Source">{row.portSource === "protocol_fixed" ? "Protocol fixed" : "User verified"}</td>
    </tr>)}</tbody>
  </table></div>;
}

function Verification({ host, steps }: { host: string; steps: readonly string[] }) {
  return <section className={styles.verification}><h3>Verify on the real {host}</h3><ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol></section>;
}

export function NfsFirewallRulesPlanner() {
  const [input, setInput] = useState<NfsFirewallInput>(defaults);
  const [result, setResult] = useState<NfsFirewallResult | null>(null);
  const [failed, setFailed] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLElement>(null);
  const failureRef = useRef<HTMLElement>(null);

  function replace(next: NfsFirewallInput) { setInput(next); setResult(null); setFailed(false); setResetMessage(null); }
  function update<Key extends keyof NfsFirewallInput>(key: Key, value: NfsFirewallInput[Key]) { replace({ ...input, [key]: value }); }
  function changeVersion(nfsVersion: NfsVersion) { replace({ ...input, nfsVersion, transport: "tcp", mountdPort: "", statdPort: "", lockdTcpPort: "", lockdUdpPort: "", includeRquotad: false, rquotadPort: "", v4CallbackPort: "" }); }
  function changeProtectedHost(protectedHost: ProtectedHost) { replace({ ...input, protectedHost, mountdPort: "", statdPort: "", lockdTcpPort: "", lockdUdpPort: "", includeRquotad: false, rquotadPort: "", v4CallbackPort: "" }); }
  function changeFirewall(firewallFamily: FirewallFamily) { replace({ ...input, firewallFamily, firewalldZone: "" }); }
  function changeAddressFamily(addressFamily: AddressFamily) { const wasDefault = input.peerCidr === "192.0.2.0/24" || input.peerCidr === "2001:db8::/64"; replace({ ...input, addressFamily, peerCidr: wasDefault ? addressFamily === "ipv4" ? "192.0.2.0/24" : "2001:db8::/64" : "" }); }
  function changeTransport(transport: NfsTransport) { replace({ ...input, transport, lockdUdpPort: "" }); }

  function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault(); setResult(null); setFailed(false); setResetMessage(null);
    try {
      const next = buildNfsFirewallPlan(input); setResult(next);
      requestAnimationFrame(() => {
        if (next.status === "invalid") { formRef.current?.querySelector<HTMLElement>('input[aria-invalid="true"], textarea[aria-invalid="true"], select[aria-invalid="true"], button[aria-invalid="true"]')?.focus(); return; }
        if (next.status === "incomplete") { const target = missingIds[next.missing[0]]; if (target) document.querySelector<HTMLElement>(`[data-focus-key="${target}"]`)?.focus(); return; }
        if (next.status === "ready" && next.translation.status === "missing_context") { document.querySelector<HTMLElement>('[data-focus-key="nfs-firewalld-zone"]')?.focus(); return; }
        resultRef.current?.focus();
      });
    } catch { setFailed(true); requestAnimationFrame(() => failureRef.current?.focus()); }
  }

  function reset() { setInput(defaults); setResult(null); setFailed(false); setResetMessage("Planner reset."); requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>('input[type="radio"]')?.focus()); }
  const errors = result?.status === "invalid" ? result.errors : {};
  const isV3 = input.nfsVersion === "v3";
  const serverV3 = isV3 && input.protectedHost === "server";
  const clientV40 = input.nfsVersion === "v4_0" && input.protectedHost === "client";
  const portField = (key: "mountdPort" | "statdPort" | "lockdTcpPort" | "lockdUdpPort" | "rquotadPort" | "v4CallbackPort") => <ToolTextField dataFocusKey={missingIds[key]} error={errors[key]} inputMode="numeric" label={missingLabels[key] ?? key} onChange={(value) => update(key, value)} required spellCheck={false} value={input[key]} />;

  return <section className={styles.tool} data-tool-workbench aria-label="NFS firewall rule inputs and result">
    <form ref={formRef} className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.groupGrid}>
        <ToolChoiceGroup label="NFS version" onChange={(value) => changeVersion(value as NfsVersion)} options={options.nfsVersion} value={input.nfsVersion} />
        <ToolChoiceGroup label="Protected host" onChange={(value) => changeProtectedHost(value as ProtectedHost)} options={options.protectedHost} value={input.protectedHost} />
        <ToolChoiceGroup label="Firewall" onChange={(value) => changeFirewall(value as FirewallFamily)} options={options.firewallFamily} value={input.firewallFamily} />
        <ToolChoiceGroup label="Address family" onChange={(value) => changeAddressFamily(value as AddressFamily)} options={options.addressFamily} value={input.addressFamily} />
      </div>
      <div className={styles.fields}>
        <ToolTextField error={errors.peerCidr} label={`Allowed ${input.protectedHost === "server" ? "client" : "server"} CIDR`} onChange={(value) => update("peerCidr", value)} required spellCheck={false} value={input.peerCidr} />
        {input.firewallFamily === "firewalld" ? <ToolTextField dataFocusKey="nfs-firewalld-zone" error={errors.firewalldZone} label="Active firewalld zone" onChange={(value) => update("firewalldZone", value)} spellCheck={false} value={input.firewalldZone} /> : null}
      </div>
      {isV3 ? <ToolChoiceGroup label="NFSv3 transport" onChange={(value) => changeTransport(value as NfsTransport)} options={options.transport} value={input.transport} /> : null}
      {isV3 || clientV40 ? <section className={styles.conditional} aria-labelledby="verified-ports"><h2 id="verified-ports">Verified listener ports</h2><div className={styles.portGrid}>{serverV3 ? portField("mountdPort") : null}{isV3 ? portField("statdPort") : null}{isV3 ? portField("lockdTcpPort") : null}{isV3 && input.transport === "tcp_udp" ? portField("lockdUdpPort") : null}{clientV40 ? portField("v4CallbackPort") : null}</div>{serverV3 ? <ToolCheckbox isSelected={input.includeRquotad} onChange={(selected) => replace({ ...input, includeRquotad: selected, rquotadPort: "" })}>Include remote quota listener</ToolCheckbox> : null}{serverV3 && input.includeRquotad ? portField("rquotadPort") : null}</section> : null}
      {errors.ports ? <ToolStatus tone="danger">{errors.ports}</ToolStatus> : null}
      <ToolActionRow><ToolButton onPress={reset} type="button"><RotateCcw aria-hidden="true" size={18} /> Reset</ToolButton><ToolButton type="submit" variant="primary">Plan firewall rules</ToolButton></ToolActionRow>
      {resetMessage ? <ToolStatus>{resetMessage}</ToolStatus> : null}
    </form>

    {failed ? <section className={styles.failure} ref={failureRef} role="alert" tabIndex={-1}><ToolStatus tone="danger">The planner could not finish. Your inputs are still here.</ToolStatus><ToolButton onPress={() => submit()} type="button">Try again</ToolButton></section> : null}
    {result?.status === "invalid" ? <section className={styles.result}><ToolStatus tone="danger">Fix the marked inputs. No plan was created.</ToolStatus></section> : null}
    {result && result.status !== "invalid" ? <section className={styles.result} ref={resultRef} tabIndex={-1}>
      <div className={styles.resultHeader}><ToolResultLead>{result.answer}</ToolResultLead>{result.status === "ready" && result.translation.status === "ready" && result.copyText ? <ToolCopyAction label="Copy plan" successLabel="Plan copied" value={result.copyText} /> : null}</div>
      {result.warnings.map((warning) => <ToolStatus key={warning} tone="warning">{warning}</ToolStatus>)}
      {result.status === "ready" ? result.boundaries.map((boundary) => <p key={boundary}>{boundary}</p>) : null}
      {result.status === "incomplete" ? <section className={styles.missing}><h3>Missing facts</h3><ul>{result.missing.map((field) => <li key={field}>{missingLabels[field] ?? field}</li>)}</ul></section> : null}
      {result.status !== "no_additional_rule" ? <ListenerTable rows={result.rows} /> : null}
      {result.status === "ready" ? <>{result.translation.status === "ready" ? <><ToolCodeOutput code={result.translation.commands.join("\n")} label={result.translation.label} /><p>{result.translation.note}</p></> : <ToolStatus tone="warning">{result.translation.note}</ToolStatus>}<Verification host="hosts" steps={result.verification} /></> : null}
      {result.status === "no_additional_rule" ? <Verification host="client" steps={result.verification} /> : null}
      {result.status !== "incomplete" ? <p className={styles.provenance}>{NFS_FIREWALL_FORMULA_VERSION} · sources checked {NFS_FIREWALL_SOURCE_DATE}</p> : null}
    </section> : null}
  </section>;
}
