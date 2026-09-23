"use client";

import { DetailDialog, DetailDialogClose } from "@/app/ui/detail-dialog";


import { Check, ExternalLink, ImageOff, PackageSearch } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { HardwareDirectoryRecord } from "@/lib/hardware-directories";
import styles from "./hardware-directory.module.css";
import { HardwareFactCardContent, hardwareFactCardClassName, hardwareCardName } from "./hardware-fact-card";

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
  const { compatibility } = getCardContent(record);
  const detailSections = record.detail_sections?.length
    ? record.detail_sections
    : [{ facts: record.facts, heading: "Recorded details" }];
  const variantLabels = record.certification_variant_kind === "z-wave"
    ? ["Certificate", "Product type / ID", "Z-Wave", "Frequency", "Firmware", "Hardware", "Date"]
    : ["Certificate", "Product ID", "Matter", "Transport", "Firmware", "Hardware", "Date"];





  return (
    <DetailDialog ariaLabel={`${record.vendor} ${record.model} details`} onClose={onClose}>
        <div className="app-detail-heading">
          <span aria-hidden="true" className="app-detail-icon"><PackageSearch /></span>
          <div><h2>{record.name}</h2><p className={styles.detailModel}>{record.vendor} {record.model}</p></div>
          <DetailDialogClose ariaLabel="Close device details" onClose={onClose} />
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
      </DetailDialog>
  );
}

function HardwareCard({ record, onSelect }: { record: HardwareDirectoryRecord; onSelect: () => void }) {
  const { cardFacts, compatibility } = getCardContent(record);
  return (
    <button aria-label={`View details for ${record.vendor} ${record.model}`} aria-haspopup="dialog" className={`directory-card ${hardwareFactCardClassName}`} onClick={onSelect} type="button">
      <HardwareFactCardContent name={hardwareCardName(record.name, record.vendor, record.model)} image={record.image_path}
        facts={[{ label: compatibility.label, value: compatibility.value }, ...cardFacts]} />
    </button>
  );
}

export function HardwareDirectoryBrowser({ records }: { records: HardwareDirectoryRecord[] }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selected = useMemo(() => records.find((record) => record.slug === selectedSlug), [records, selectedSlug]);

  const close = () => setSelectedSlug(null);

  return (
    <>
      <div className="directory-card-grid">
        {records.map((record) => <HardwareCard key={record.slug} onSelect={() => setSelectedSlug(record.slug)} record={record} />)}
      </div>
      {selected ? <HardwareDetails onClose={close} record={selected} /> : null}
    </>
  );
}
