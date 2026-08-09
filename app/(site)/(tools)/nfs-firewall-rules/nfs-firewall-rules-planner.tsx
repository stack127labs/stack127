"use client";

import { Clipboard, RotateCcw } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import {
  NFS_FIREWALL_FORMULA_VERSION,
  NFS_FIREWALL_SOURCE_DATE,
  type AddressFamily,
  type FirewallFamily,
  type NfsFirewallInput,
  type NfsFirewallResult,
  type NfsListenerRow,
  type NfsTransport,
  type NfsVersion,
  type ProtectedHost,
  buildNfsFirewallPlan,
} from "../../../../lib/nfs-firewall/plan";
import styles from "./nfs-firewall-rules.module.css";

const defaults: NfsFirewallInput = {
  nfsVersion: "v4_1_plus",
  protectedHost: "server",
  firewallFamily: "firewalld",
  addressFamily: "ipv4",
  peerCidr: "192.0.2.0/24",
  transport: "tcp",
  firewalldZone: "",
  mountdPort: "",
  statdPort: "",
  lockdTcpPort: "",
  lockdUdpPort: "",
  includeRquotad: false,
  rquotadPort: "",
  v4CallbackPort: "",
};

const labels = {
  nfsVersion: { v3: "NFSv3", v4_0: "NFSv4.0", v4_1_plus: "NFSv4.1+" },
  protectedHost: { server: "NFS server", client: "NFS client" },
  firewallFamily: { firewalld: "firewalld", ufw: "UFW", nftables: "nftables" },
  addressFamily: { ipv4: "IPv4", ipv6: "IPv6" },
  transport: { tcp: "TCP only", tcp_udp: "TCP + legacy UDP" },
} as const;

const missingIds: Partial<Record<keyof NfsFirewallInput, string>> = {
  mountdPort: "nfs-mountd-port",
  statdPort: "nfs-statd-port",
  lockdTcpPort: "nfs-lockd-tcp-port",
  lockdUdpPort: "nfs-lockd-udp-port",
  rquotadPort: "nfs-rquotad-port",
  v4CallbackPort: "nfs-v4-callback-port",
};

function RadioGroup<T extends string>({
  legend,
  name,
  values,
  value,
  labelMap,
  onChange,
  firstRef,
}: {
  legend: string;
  name: string;
  values: readonly T[];
  value: T;
  labelMap: Record<T, string>;
  onChange: (value: T) => void;
  firstRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <fieldset className={styles.choiceFieldset}>
      <legend>{legend}</legend>
      <div className={styles.choiceRow}>
        {values.map((option, index) => (
          <label className={styles.choice} key={option}>
            <input
              ref={index === 0 ? firstRef : undefined}
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            <span>{labelMap[option]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ListenerTable({ rows }: { rows: readonly NfsListenerRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className={styles.tableWrap} role="region" aria-label="Listener plan" tabIndex={0}>
      <table className={styles.listenerTable}>
        <thead><tr><th>Service</th><th>Protected host</th><th>Direction</th><th>Peer source</th><th>Protocol</th><th>Port</th><th>Port source</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.endpoint}-${row.protocol}-${row.port}-${row.service}`}>
              <td data-label="Service"><code>{row.service}</code><span className={styles.rowReason}>{row.reason}</span></td>
              <td data-label="Protected host">NFS {row.endpoint}</td>
              <td data-label="Direction">{row.direction}</td>
              <td data-label="Peer source"><code>{row.peerCidr}</code></td>
              <td data-label="Protocol">{row.protocol.toUpperCase()}</td>
              <td data-label="Port"><code>{row.port}</code></td>
              <td data-label="Port source">{row.portSource === "protocol_fixed" ? "Protocol fixed" : "User verified"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PortField({ id, label, value, error, onChange }: { id: string; label: string; value: string; error?: string; onChange: (value: string) => void }) {
  const errorId = `${id}-error`;
  return (
    <label className={styles.field} htmlFor={id}>
      <span>{label}</span>
      <input id={id} inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />
      {error ? <span className={styles.error} id={errorId}>{error}</span> : <span className={styles.fieldHint}>Use the port verified on this host.</span>}
    </label>
  );
}

export function NfsFirewallRulesPlanner() {
  const [input, setInput] = useState<NfsFirewallInput>(defaults);
  const [result, setResult] = useState<NfsFirewallResult | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const firstVersionRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  function replace(next: NfsFirewallInput) {
    setInput(next);
    setResult(null);
    setCopyStatus("");
  }

  function update<Key extends keyof NfsFirewallInput>(key: Key, value: NfsFirewallInput[Key]) {
    replace({ ...input, [key]: value });
  }

  function changeVersion(nfsVersion: NfsVersion) {
    replace({ ...input, nfsVersion, transport: "tcp", mountdPort: "", statdPort: "", lockdTcpPort: "", lockdUdpPort: "", includeRquotad: false, rquotadPort: "", v4CallbackPort: "" });
  }

  function changeProtectedHost(protectedHost: ProtectedHost) {
    replace({ ...input, protectedHost, mountdPort: "", statdPort: "", lockdTcpPort: "", lockdUdpPort: "", includeRquotad: false, rquotadPort: "", v4CallbackPort: "" });
  }

  function changeFirewall(firewallFamily: FirewallFamily) {
    replace({ ...input, firewallFamily, firewalldZone: "" });
  }

  function changeAddressFamily(addressFamily: AddressFamily) {
    const wasDefault = input.peerCidr === "192.0.2.0/24" || input.peerCidr === "2001:db8::/64";
    replace({ ...input, addressFamily, peerCidr: wasDefault ? addressFamily === "ipv4" ? "192.0.2.0/24" : "2001:db8::/64" : "" });
  }

  function changeTransport(transport: NfsTransport) {
    replace({ ...input, transport, lockdUdpPort: "" });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = buildNfsFirewallPlan(input);
    setResult(next);
    setCopyStatus("");
    requestAnimationFrame(() => {
      if (next.status === "invalid") {
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
        return;
      }
      if (next.status === "incomplete") {
        const target = missingIds[next.missing[0]];
        if (target) document.getElementById(target)?.focus();
        return;
      }
      if (next.status === "ready" && next.translation.status === "missing_context") {
        document.getElementById("nfs-firewalld-zone")?.focus();
      }
    });
  }

  function reset() {
    setInput(defaults);
    setResult(null);
    setCopyStatus("");
    requestAnimationFrame(() => firstVersionRef.current?.focus());
  }

  async function copyPlan() {
    if (result?.status !== "ready" || result.translation.status !== "ready" || !result.copyText) return;
    try {
      await navigator.clipboard.writeText(result.copyText);
      setCopyStatus("Plan copied.");
    } catch {
      setCopyStatus("Copy failed. Select the commands.");
    }
  }

  const errors = result?.status === "invalid" ? result.errors : {};
  const isV3 = input.nfsVersion === "v3";
  const serverV3 = isV3 && input.protectedHost === "server";
  const clientV40 = input.nfsVersion === "v4_0" && input.protectedHost === "client";

  return (
    <section className={styles.tool} aria-label="NFS firewall rule inputs and result">
      <form ref={formRef} className={styles.form} onSubmit={submit} noValidate>
        <div className={styles.groupGrid}>
          <RadioGroup legend="NFS version" name="nfsVersion" values={["v3", "v4_0", "v4_1_plus"]} value={input.nfsVersion} labelMap={labels.nfsVersion} onChange={changeVersion} firstRef={firstVersionRef} />
          <RadioGroup legend="Protected host" name="protectedHost" values={["server", "client"]} value={input.protectedHost} labelMap={labels.protectedHost} onChange={changeProtectedHost} />
          <RadioGroup legend="Firewall" name="firewallFamily" values={["firewalld", "ufw", "nftables"]} value={input.firewallFamily} labelMap={labels.firewallFamily} onChange={changeFirewall} />
          <RadioGroup legend="Address family" name="addressFamily" values={["ipv4", "ipv6"]} value={input.addressFamily} labelMap={labels.addressFamily} onChange={changeAddressFamily} />
        </div>

        <div className={styles.fields}>
          <label className={styles.field} htmlFor="nfs-peer-cidr">
            <span>Allowed {input.protectedHost === "server" ? "client" : "server"} CIDR</span>
            <input id="nfs-peer-cidr" value={input.peerCidr} onChange={(event) => update("peerCidr", event.target.value)} aria-invalid={Boolean(errors.peerCidr)} aria-describedby={errors.peerCidr ? "nfs-peer-cidr-error" : "nfs-peer-cidr-hint"} spellCheck={false} />
            {errors.peerCidr ? <span className={styles.error} id="nfs-peer-cidr-error">{errors.peerCidr}</span> : <span className={styles.fieldHint} id="nfs-peer-cidr-hint">Remote source for proposed inbound rules.</span>}
          </label>
          {input.firewallFamily === "firewalld" ? (
            <label className={styles.field} htmlFor="nfs-firewalld-zone">
              <span>Active firewalld zone</span>
              <input id="nfs-firewalld-zone" value={input.firewalldZone} onChange={(event) => update("firewalldZone", event.target.value)} aria-invalid={Boolean(errors.firewalldZone)} aria-describedby={errors.firewalldZone ? "nfs-firewalld-zone-error" : "nfs-firewalld-zone-hint"} spellCheck={false} />
              {errors.firewalldZone ? <span className={styles.error} id="nfs-firewalld-zone-error">{errors.firewalldZone}</span> : <span className={styles.fieldHint} id="nfs-firewalld-zone-hint">Required for commands. The planner never assumes <code>public</code>.</span>}
            </label>
          ) : null}
        </div>

        {isV3 ? <RadioGroup legend="NFSv3 transport" name="transport" values={["tcp", "tcp_udp"]} value={input.transport} labelMap={labels.transport} onChange={changeTransport} /> : null}

        {isV3 || clientV40 ? (
          <div className={styles.conditional}>
            <h2>Locally verified listener ports</h2>
            <p>Use ports verified on the protected host.</p>
            <div className={styles.portGrid}>
              {serverV3 ? <PortField id="nfs-mountd-port" label="mountd port" value={input.mountdPort} error={errors.mountdPort} onChange={(value) => update("mountdPort", value)} /> : null}
              {isV3 ? <PortField id="nfs-statd-port" label="statd port" value={input.statdPort} error={errors.statdPort} onChange={(value) => update("statdPort", value)} /> : null}
              {isV3 ? <PortField id="nfs-lockd-tcp-port" label="lockd TCP port" value={input.lockdTcpPort} error={errors.lockdTcpPort} onChange={(value) => update("lockdTcpPort", value)} /> : null}
              {isV3 && input.transport === "tcp_udp" ? <PortField id="nfs-lockd-udp-port" label="lockd UDP port" value={input.lockdUdpPort} error={errors.lockdUdpPort} onChange={(value) => update("lockdUdpPort", value)} /> : null}
              {clientV40 ? <PortField id="nfs-v4-callback-port" label="NFSv4.0 callback TCP port" value={input.v4CallbackPort} error={errors.v4CallbackPort} onChange={(value) => update("v4CallbackPort", value)} /> : null}
            </div>
            {serverV3 ? (
              <label className={styles.checkChoice}>
                <input type="checkbox" checked={input.includeRquotad} onChange={(event) => replace({ ...input, includeRquotad: event.target.checked, rquotadPort: "" })} />
                <span>Include a verified remote quota listener</span>
              </label>
            ) : null}
            {serverV3 && input.includeRquotad ? <div className={styles.portGrid}><PortField id="nfs-rquotad-port" label="rquotad port" value={input.rquotadPort} error={errors.rquotadPort} onChange={(value) => update("rquotadPort", value)} /></div> : null}
          </div>
        ) : null}

        {errors.ports ? <p className={styles.error} role="alert">{errors.ports}</p> : null}
        <div className={styles.actions}>
          <button ref={submitRef} className={styles.primaryButton} type="submit">Plan firewall rules</button>
          <button className={styles.secondaryButton} type="button" onClick={reset}><RotateCcw aria-hidden="true" size={18} /> Reset</button>
        </div>
      </form>

      {result?.status === "invalid" ? (
        <div className={styles.result} aria-live="polite"><h2>Fix the marked input</h2><p>No listener plan or command was created.</p></div>
      ) : null}

      {result?.status === "incomplete" ? (
        <div className={styles.result} aria-live="polite">
          <div><p className={styles.statusLabel}>Incomplete plan</p><h2>{result.answer}</h2></div>
          {result.warnings.map((warning) => <p className={styles.warning} key={warning}>{warning}</p>)}
          <ListenerTable rows={result.rows} />
          <div><h3>Missing facts</h3><ul>{result.missing.map((field) => <li key={field}>{missingIds[field]?.replace("nfs-", "").replaceAll("-", " ") ?? field}</li>)}</ul></div>
        </div>
      ) : null}

      {result?.status === "no_additional_rule" ? (
        <div className={styles.result} aria-live="polite">
          <div><p className={styles.statusLabel}>NFSv4.1+ client</p><h2>{result.answer}</h2></div>
          {result.warnings.map((warning) => <p className={styles.warning} key={warning}>{warning}</p>)}
          <div><h3>Verify on the real client</h3><ol>{result.verification.map((step) => <li key={step}>{step}</li>)}</ol></div>
          <p className={styles.provenance}>{NFS_FIREWALL_FORMULA_VERSION} · sources checked {NFS_FIREWALL_SOURCE_DATE}</p>
        </div>
      ) : null}

      {result?.status === "ready" ? (
        <div className={styles.result} aria-live="polite">
          <div className={styles.resultHeader}>
            <div><p className={styles.statusLabel}>Listener plan</p><h2>{result.answer}</h2></div>
            {result.translation.status === "ready" ? <button className={styles.secondaryButton} type="button" onClick={copyPlan}><Clipboard aria-hidden="true" size={18} /> Copy plan</button> : null}
          </div>
          <p className={styles.copyStatus} aria-live="polite">{copyStatus}</p>
          {result.warnings.map((warning) => <p className={styles.warning} key={warning}>{warning}</p>)}
          {result.boundaries.map((boundary) => <p className={styles.boundary} key={boundary}>{boundary}</p>)}
          <ListenerTable rows={result.rows} />
          <div className={styles.translation}>
            <h3>{result.translation.label}</h3>
            {result.translation.status === "ready" ? <pre><code>{result.translation.commands.join("\n")}</code></pre> : null}
            <p>{result.translation.note}</p>
          </div>
          <div><h3>Verify on the real hosts</h3><ol>{result.verification.map((step) => <li key={step}>{step}</li>)}</ol></div>
          <p className={styles.provenance}>{NFS_FIREWALL_FORMULA_VERSION} · sources checked {NFS_FIREWALL_SOURCE_DATE}</p>
        </div>
      ) : null}
    </section>
  );
}
