"use client";

import { useMemo, useState } from "react";
import { StatePill } from "@/app/(site)/(tools)/(domain)/domain-lookup-client";

export type TldRow = {
  tld: string;
  unicode: string | null;
  type: string | null;
  organisation: string | null;
  rdap: "bootstrap" | "override" | "none";
  rdapOperator: string | null;
  dnssec: boolean;
  isIdn: boolean;
};

const TYPES = ["generic", "country-code", "sponsored", "infrastructure", "generic-restricted", "test"];
const PAGE_SIZE = 100;

export function TldTable({ rows }: { rows: TldRow[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [rdap, setRdap] = useState("");
  const [dnssec, setDnssec] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase().replace(/^\./, "");
    return rows.filter((row) => {
      if (type && row.type !== type) return false;
      if (rdap === "yes" && row.rdap === "none") return false;
      if (rdap === "no" && row.rdap !== "none") return false;
      if (dnssec === "yes" && !row.dnssec) return false;
      if (dnssec === "no" && row.dnssec) return false;
      if (!needle) return true;
      return (
        row.tld.includes(needle) ||
        (row.unicode?.toLowerCase().includes(needle) ?? false) ||
        (row.organisation?.toLowerCase().includes(needle) ?? false)
      );
    });
  }, [rows, query, type, rdap, dnssec]);

  const shown = filtered.slice(0, limit);

  return (
    <section className="domain-tool" aria-label="TLD directory">
      <div className="domain-form">
        <label className="domain-name-field">
          <span>Search an ending or an operator</span>
          <input
            autoCapitalize="none"
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setLimit(PAGE_SIZE);
            }}
            placeholder="uk, verisign, 中国"
            spellCheck={false}
            value={query}
          />
        </label>
        <div className="domain-tld-options">
          <label>
            <span>Type</span>
            <select onChange={(event) => setType(event.target.value)} value={type}>
              <option value="">All</option>
              {TYPES.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>We can look it up</span>
            <select onChange={(event) => setRdap(event.target.value)} value={rdap}>
              <option value="">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label>
            <span>DNSSEC</span>
            <select onChange={(event) => setDnssec(event.target.value)} value={dnssec}>
              <option value="">All</option>
              <option value="yes">Signed</option>
              <option value="no">Not signed</option>
            </select>
          </label>
        </div>
        <p className="domain-meta">
          {filtered.length.toLocaleString("en-US")} of {rows.length.toLocaleString("en-US")} endings
          {filtered.length > shown.length ? `, showing the first ${shown.length.toLocaleString("en-US")}` : ""}.
        </p>
      </div>

      <div className="domain-table-scroll">
        <table className="domain-table">
          <thead>
            <tr>
              <th>Ending</th>
              <th>Type</th>
              <th>Operator</th>
              <th>Lookups</th>
              <th>DNSSEC</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.tld}>
                <td>
                  <code>.{row.unicode ?? row.tld}</code>
                  {row.unicode ? (
                    <small style={{ display: "block" }}>
                      <code>.{row.tld}</code>
                    </small>
                  ) : null}
                </td>
                <td className="domain-state-quiet">{row.type ?? "Unknown"}</td>
                <td>{row.organisation ?? <span className="domain-state-quiet">Not published</span>}</td>
                <td>
                  {row.rdap === "none" ? (
                    <StatePill tone="quiet">Cannot check</StatePill>
                  ) : row.rdap === "override" ? (
                    <StatePill tone="warn">Via our own list</StatePill>
                  ) : (
                    <StatePill tone="good">Yes</StatePill>
                  )}
                  {row.rdapOperator ? <small style={{ display: "block" }}>{row.rdapOperator}</small> : null}
                </td>
                <td>
                  {row.dnssec ? (
                    <StatePill tone="good">Signed</StatePill>
                  ) : (
                    <StatePill tone="quiet">Not signed</StatePill>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > shown.length ? (
        <button className="domain-download" onClick={() => setLimit((value) => value + 250)} type="button">
          Show more
        </button>
      ) : null}
    </section>
  );
}
