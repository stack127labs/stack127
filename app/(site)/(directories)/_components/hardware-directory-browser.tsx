"use client";

import { Check, ExternalLink, ImageOff, PackageSearch } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import type { HardwareDirectoryRecord } from "@/lib/hardware-directories";
import styles from "./hardware-directory.module.css";

const unresolvedValue = /^(unknown|not recorded|no or unknown|not published)$/i;

function MissingProductImage() {
  return <div className={styles.missingImage}><ImageOff aria-hidden="true" /><span>Product image not published</span></div>;
}

function getCardContent(record: HardwareDirectoryRecord) {
  const compatibility = record.card?.compatibility ?? {
    label: record.evidence[0]?.label ?? "Compatibility",
    status: "reported" as const,
    value: record.evidence[0]?.value ?? "Source record",
  };
  const preferred = record.card?.facts ?? record.stats;
  const cardFacts = preferred.filter((fact) => fact.value && !unresolvedValue.test(fact.value)).slice(0, 2);
  if (cardFacts.length < 2) {
    for (const fact of record.facts) {
      if (!fact.value || unresolvedValue.test(fact.value) || cardFacts.some((item) => item.label === fact.label)) continue;
      cardFacts.push(fact);
      if (cardFacts.length === 2) break;
    }
  }
  return { cardFacts, compatibility };
}

function HardwareDetails({ record, onClose }: { record: HardwareDirectoryRecord; onClose: () => void }) {
  const panelRef = useRef<HTMLElement>(null);
  const { compatibility } = getCardContent(record);
  const detailSections = record.detail_sections?.length
    ? record.detail_sections
    : [{ facts: record.facts, heading: "Recorded details" }];
  const variantLabels = record.certification_variant_kind === "z-wave"
    ? ["Certificate", "Product type / ID", "Z-Wave", "Frequency", "Firmware", "Hardware", "Date"]
    : ["Certificate", "Product ID", "Matter", "Transport", "Firmware", "Hardware", "Date"];

  useEffect(() => {
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(
      'summary, a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.classList.add("app-detail-open");
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.classList.remove("app-detail-open");
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const close = (event: MouseEvent | PointerEvent) => {
    event.stopPropagation();
    onClose();
  };

  return (
    <div className="app-detail-overlay" onClick={onClose} onPointerDown={onClose}>
      <aside
        aria-label={`${record.vendor} ${record.model} details`}
        aria-modal="true"
        className="app-detail-panel app-detail-panel-overlay"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        ref={panelRef}
        role="dialog"
      >
        <div className="app-detail-heading">
          <span aria-hidden="true" className="app-detail-icon"><PackageSearch /></span>
          <div><h2>{record.name}</h2><p className={styles.detailModel}>{record.vendor} {record.model}</p></div>
          <button aria-label="Close device details" className="app-detail-close" onClick={close} onPointerDown={close} type="button">×</button>
        </div>

        <div className="app-detail-categories">
          <span className="category-badge">{record.category}</span>
          <span className={styles.compatibilityBadge} data-status={compatibility.status}>{compatibility.label}: {compatibility.value}</span>
        </div>

        <div className={styles.detailImageFrame}>
          {record.image_path
            ? <Image alt={`${record.vendor} ${record.model}`} className={styles.detailImage} height={480} src={record.image_path} unoptimized width={480} />
            : <MissingProductImage />}
        </div>

        {detailSections.map((section) => section.facts.length > 0 ? (
          <section className={styles.detailGroup} key={section.heading}>
            <h3>{section.heading}</h3>
            <dl className={styles.identifierList}>
              {section.facts.map((fact) => <div key={`${section.heading}-${fact.label}-${fact.value}`}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
            </dl>
          </section>
        ) : null)}

        {record.certification_variants?.length ? (
          <details className={styles.variantSection}>
            <summary><span>Certification variants</span><span>{record.certification_variants.length.toLocaleString("en-US")}</span></summary>
            <div className={styles.variantTableWrap} tabIndex={0}>
              <table className={styles.variantTable}>
                <thead><tr>{variantLabels.map((label) => <th key={label}>{label}</th>)}</tr></thead>
                <tbody>{record.certification_variants.map((variant) => (
                  <tr key={`${variant.certificate_id}-${variant.product_id ?? ""}-${variant.firmware_version ?? ""}`}>
                    <th scope="row"><a href={variant.source_url} rel="noreferrer" target="_blank">{variant.certificate_id}<ExternalLink aria-hidden="true" size={12} /></a></th>
                    <td>{variant.product_id ?? "not published"}</td>
                    <td>{variant.matter_version ?? "not published"}</td>
                    <td>{variant.transport ?? "not published"}</td>
                    <td>{variant.firmware_version ?? "not published"}</td>
                    <td>{variant.hardware_version ?? "not published"}</td>
                    <td>{variant.certified_date ?? "not published"}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </details>
        ) : null}

        <table className={styles.detailEvidence}>
          <caption>Sources and provenance</caption>
          <thead><tr><th scope="col">Field or source</th><th scope="col">Evidence</th></tr></thead>
          <tbody>{record.provenance?.length
            ? record.provenance.map((item, index) => <tr key={`${item.field}-${item.source}-${index}`}><th scope="row">{item.field}</th><td><a href={item.url} rel="noreferrer" target="_blank">{item.source}</a></td></tr>)
            : record.evidence.map((item) => <tr key={`${item.label}-${item.value}`}><th scope="row">{item.label}</th><td>{item.value}</td></tr>)}</tbody>
        </table>

        {record.notes.length > 0 ? (
          <details className={styles.detailSection}>
            <summary><span>Model notes</span><span>{record.notes.length}</span></summary>
            <ul>{record.notes.map((note) => <li key={note}>{note}</li>)}</ul>
          </details>
        ) : null}

        <div className="app-detail-primary-links">
          {record.amazon ? <a className="primary" href={record.amazon.url} rel="sponsored noreferrer" target="_blank"><span>Check price on Amazon</span><ExternalLink aria-hidden="true" size={14} /></a> : null}
          {record.source_links.map((link, index) => (
            <a className={!record.amazon && index === 0 ? "primary" : undefined} href={link.url} key={`${link.label}-${link.url}`} rel="noreferrer" target="_blank">
              <span>{!record.amazon && index === 0 ? <Check aria-hidden="true" /> : null}{link.label}</span><ExternalLink aria-hidden="true" size={14} />
            </a>
          ))}
          {record.image_source_url ? <a href={record.image_source_url} rel="noreferrer" target="_blank"><span>Image source</span><ExternalLink aria-hidden="true" size={14} /></a> : null}
        </div>
      </aside>
    </div>
  );
}

function HardwareCard({ record, onSelect }: { record: HardwareDirectoryRecord; onSelect: (button: HTMLButtonElement) => void }) {
  const { cardFacts, compatibility } = getCardContent(record);
  return (
    <button aria-label={`View details for ${record.vendor} ${record.model}`} className={`directory-card ${styles.card}`} onClick={(event) => onSelect(event.currentTarget)} type="button">
      <div className={styles.cardImageFrame}>
        {record.image_path
          ? <Image alt={`${record.vendor} ${record.model}`} className={styles.cardImage} height={480} loading="lazy" sizes="(max-width: 650px) calc(100vw - 44px), (max-width: 900px) 50vw, 310px" src={record.image_path} unoptimized width={480} />
          : <MissingProductImage />}
      </div>
      <div className={styles.cardHeading}>
        <p className={styles.cardIdentity}>{record.vendor} <code>{record.model}</code></p>
        <div className="directory-card-title-row"><h2>{record.name}</h2></div>
      </div>
      <div className={styles.compatibilityRow} data-status={compatibility.status}>
        <Check aria-hidden="true" size={15} />
        <span>{compatibility.label}</span>
        <strong>{compatibility.value}</strong>
      </div>
      <dl className={styles.cardFacts}>{cardFacts.map((fact) => <div key={`${fact.label}-${fact.value}`}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
    </button>
  );
}

export function HardwareDirectoryBrowser({ records }: { records: HardwareDirectoryRecord[] }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const selected = useMemo(() => records.find((record) => record.slug === selectedSlug), [records, selectedSlug]);

  useEffect(() => {
    if (selectedSlug === null && openerRef.current) openerRef.current.focus();
  }, [selectedSlug]);

  const close = () => setSelectedSlug(null);

  return (
    <>
      <div className="directory-card-grid">
        {records.map((record) => <HardwareCard key={record.slug} onSelect={(button) => { openerRef.current = button; setSelectedSlug(record.slug); }} record={record} />)}
      </div>
      {selected ? <HardwareDetails onClose={close} record={selected} /> : null}
    </>
  );
}
