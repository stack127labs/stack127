"use client";

import { DetailDialog, DetailDialogClose } from "@/app/ui/detail-dialog";


import { Check, ExternalLink, ImageOff, PackageSearch } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { HardwareDirectoryLink, HardwareDirectoryRecord } from "@/lib/hardware-directories";
import { hardwareDirectoryCard, type HardwareDirectoryCardRecord } from "@/lib/hardware-directories/card";
import { hardwareCardName } from "@/lib/hardware-directories/card-name";
import styles from "./hardware-directory.module.css";
import { HardwareFactCardContent, hardwareFactCardClassName } from "./hardware-fact-card";

function MissingProductImage() {
  return <div className={styles.missingImage}><ImageOff aria-hidden="true" /><span>No product image</span></div>;
}

function sourceLinksForReader(record: HardwareDirectoryRecord): HardwareDirectoryLink[] {
  const candidates = record.source_links.length > 0
    ? record.source_links
    : (record.provenance ?? []).map(({ source, url }) => ({ label: source, url }));
  const seen = new Set<string>();
  const links: HardwareDirectoryLink[] = [];

  for (const link of candidates) {
    if (/^pinned\b/i.test(link.label) || /^image source$/i.test(link.label)) continue;
    if (!seen.has(link.url)) {
      seen.add(link.url);
      let label = link.label;
      if (/^latest csa certification$/i.test(label)) label = "Matter certification";
      else if (/^latest z-wave alliance certification$/i.test(label)) label = "Z-Wave certification";
      else if (/^compatibility record$/i.test(label)) label = "Compatibility details";
      else if (/^nut compatibility list$/i.test(label)) label = "NUT support listing";
      else if (/^manufacturer page$/i.test(label)) label = "Manufacturer product page";
      else if (/^product page$/i.test(label)) label = "Product information";
      else if (/^retail link \d+$/i.test(label)) label = "Retailer product listing";
      else if (/^cc0 camera record$/i.test(label)) label = "Camera compatibility listing";
      else if (/^compliance document$/i.test(label)) label = "Compliance document";
      else if (/^z-wave js configuration$/i.test(label)) label = "Z-Wave JS configuration";
      else if (/^(evidence source|upstream reference) \d+$/i.test(label)) {
        label = new URL(link.url).hostname.replace(/^www\./i, "");
      } else if (/\.pdf$/i.test(label)) label = "Product document";
      links.push({ label, url: link.url });
    }
  }

  return links;
}

function isUnhelpfulFact(fact: { label: string; value: string }) {
  return /^(added( to source)?|certification records|record title)$/i.test(fact.label)
    || /^(unknown|not recorded|no or unknown|n\/a|—)$/i.test(fact.value.trim())
    || /\bnot published\b|\bnot recorded\b|^date not published$/i.test(fact.value.trim());
}

function readerFactLabel(label: string) {
  if (/^record scope$/i.test(label)) return "Listing type";
  if (/^hcl model$/i.test(label)) return "Model";
  return label;
}

function isInternalNote(note: string) {
  return /^(latest .* certification|compliance document|z-wave js configuration|compatibility record|pinned\b.*|manufacturer page|image source|cc0 camera record|evidence source \d+|upstream reference \d+|.*\.pdf)$/i.test(note.trim())
    || /verified against|official .*\b(datasheet|manual|document)|per the manual|source record|source revision|not published in source/i.test(note);
}

function FactValue({ value }: { value: string }) {
  return value.length > 220
    ? <details className={styles.longFact}><summary>Show details</summary><p>{value}</p></details>
    : value;
}

function readerFactValue(value: string) {
  if (/^(support|community) record available$/i.test(value)) return "Listed";
  return value;
}

function HardwareDetails({ record, onClose }: { record: HardwareDirectoryRecord; onClose: () => void }) {
  const { compatibility } = hardwareDirectoryCard(record);
  const detailSections = (record.detail_sections?.length
    ? record.detail_sections
    : [{ facts: record.facts, heading: "Details" }])
    .filter((section) => !/^(certification coverage|sources?( and provenance)?|provenance)$/i.test(section.heading.trim()))
    .map((section) => ({
      ...section,
      facts: section.facts.filter((fact) => !isUnhelpfulFact(fact)).map((fact) => ({ ...fact, label: readerFactLabel(fact.label) })),
    }))
    .filter((section) => section.facts.length > 0);
  const notes = record.notes.filter((note) => note.length <= 320 && !isInternalNote(note));
  const sourceLinks = sourceLinksForReader(record);
  const primarySourceLinks = sourceLinks.slice(0, 2);
  const moreSourceLinks = sourceLinks.slice(2);
  const variantLabels = record.certification_variant_kind === "z-wave"
    ? ["Certificate", "Product type / ID", "Z-Wave", "Frequency", "Firmware", "Hardware", "Date"]
    : ["Certificate", "Product ID", "Matter", "Transport", "Firmware", "Hardware", "Date"];
  const longSections = new Set(["Local streams", "Connection configurations"]);

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
            ? <Image alt={`${record.vendor} ${record.model}`} className={styles.detailImage} height={480} src={record.image_path} sizes="480px" width={480} />
            : <MissingProductImage />}
        </div>

        {record.image_source_url ? <p className={styles.imageCredit}><a href={record.image_source_url} rel="noreferrer" target="_blank">Image credit</a></p> : null}

        {detailSections.map((section) => (
          longSections.has(section.heading) || section.facts.length > 6 ? (
            <details className={styles.detailSection} key={section.heading}>
              <summary><span>{section.heading === "Connection configurations" ? "More driver and connection options" : section.heading}</span><span>{section.facts.length}</span></summary>
              <dl className={styles.identifierList}>
                {section.facts.map((fact) => <div key={`${section.heading}-${fact.label}-${fact.value}`}><dt>{fact.label}</dt><dd><FactValue value={readerFactValue(fact.value)} /></dd></div>)}
              </dl>
            </details>
          ) : (
            <section className={styles.detailGroup} key={section.heading}>
              <h3>{section.heading}</h3>
              <dl className={styles.identifierList}>
                {section.facts.map((fact) => <div key={`${section.heading}-${fact.label}-${fact.value}`}><dt>{fact.label}</dt><dd><FactValue value={readerFactValue(fact.value)} /></dd></div>)}
              </dl>
            </section>
          )
        ))}

        {record.certification_variants?.length ? (
          <details className={styles.variantSection}>
            <summary><span>Certification variants</span><span>{record.certification_variants.length.toLocaleString("en-US")}</span></summary>
            <div className={styles.variantTableWrap} tabIndex={0}>
              <table className={styles.variantTable}>
                <thead><tr>{variantLabels.map((label) => <th key={label}>{label}</th>)}</tr></thead>
                <tbody>{record.certification_variants.map((variant) => (
                  <tr key={`${variant.certificate_id}-${variant.product_id ?? ""}-${variant.firmware_version ?? ""}`}>
                    <th scope="row"><a href={variant.source_url} rel="noreferrer" target="_blank">{variant.certificate_id}<ExternalLink aria-hidden="true" size={12} /></a></th>
                    <td>{variant.product_id ?? "Not listed"}</td>
                    <td>{variant.matter_version ?? "Not listed"}</td>
                    <td>{variant.transport ?? "Not listed"}</td>
                    <td>{variant.firmware_version ?? "Not listed"}</td>
                    <td>{variant.hardware_version ?? "Not listed"}</td>
                    <td>{variant.certified_date ?? "Not listed"}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </details>
        ) : null}

        {notes.length > 0 ? (
          <details className={styles.detailSection}>
            <summary><span>Model notes</span><span>{notes.length}</span></summary>
            <ul>{notes.map((note) => <li key={note}>{note}</li>)}</ul>
          </details>
        ) : null}

        <div className="app-detail-primary-links">
          {record.amazon ? <a className="primary" href={record.amazon.url} rel="sponsored noreferrer" target="_blank"><span>Check price on Amazon</span><ExternalLink aria-hidden="true" size={14} /></a> : null}
          {primarySourceLinks.map((link, index) => (
            <a className={!record.amazon && index === 0 ? "primary" : undefined} href={link.url} key={`${link.label}-${link.url}`} rel="noreferrer" target="_blank">
              <span>{!record.amazon && index === 0 ? <Check aria-hidden="true" /> : null}{link.label}</span><ExternalLink aria-hidden="true" size={14} />
            </a>
          ))}
        </div>
        {moreSourceLinks.length > 0 ? <details className={styles.detailSection}>
          <summary><span>More sources</span><span>{moreSourceLinks.length}</span></summary>
          <ul>{moreSourceLinks.map((link) => <li key={`${link.label}-${link.url}`}><a href={link.url} rel="noreferrer" target="_blank">{link.label}</a></li>)}</ul>
        </details> : null}
      </DetailDialog>
  );
}

function HardwareCard({ record, onSelect }: { record: HardwareDirectoryCardRecord; onSelect: () => void }) {
  const { cardFacts, compatibility } = record;
  return (
    <button aria-label={`View details for ${record.vendor} ${record.model}`} aria-haspopup="dialog" className={`directory-card ${hardwareFactCardClassName}`} data-missing-image={record.image_path ? "false" : "true"} onClick={onSelect} type="button">
      <HardwareFactCardContent name={hardwareCardName(record.name, record.vendor, record.model)} image={record.image_path}
        facts={[{ label: compatibility.label, value: compatibility.value }, ...cardFacts]} />
    </button>
  );
}

export function HardwareDirectoryBrowser({ directory, records }: { directory: string; records: HardwareDirectoryCardRecord[] }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [detailsBySlug, setDetailsBySlug] = useState<Record<string, HardwareDirectoryRecord>>({});
  const [loadError, setLoadError] = useState(false);
  const selected = selectedSlug ? detailsBySlug[selectedSlug] : undefined;

  useEffect(() => {
    if (!selectedSlug || detailsBySlug[selectedSlug]) return;
    const controller = new AbortController();
    setLoadError(false);
    fetch(`/api/hardware-directory/${encodeURIComponent(directory)}/${encodeURIComponent(selectedSlug)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Device details could not be loaded.");
        return response.json() as Promise<HardwareDirectoryRecord>;
      })
      .then((record) => setDetailsBySlug((current) => ({ ...current, [record.slug]: record })))
      .catch(() => { if (!controller.signal.aborted) setLoadError(true); });
    return () => controller.abort();
  }, [detailsBySlug, directory, selectedSlug]);

  const close = () => { setSelectedSlug(null); setLoadError(false); };

  return (
    <>
      <div className="directory-card-grid">
        {records.map((record) => <HardwareCard key={record.slug} onSelect={() => setSelectedSlug(record.slug)} record={record} />)}
      </div>
      {selected ? <HardwareDetails onClose={close} record={selected} /> : null}
      {selectedSlug && !selected ? <DetailDialog ariaLabel="Device details" onClose={close}>
        <div className="app-detail-heading"><h2>Device details</h2><DetailDialogClose ariaLabel="Close device details" onClose={close} /></div>
        <p role={loadError ? "alert" : "status"}>{loadError ? "Device details could not be loaded. Close this panel and try again." : "Loading device details…"}</p>
      </DetailDialog> : null}
    </>
  );
}
