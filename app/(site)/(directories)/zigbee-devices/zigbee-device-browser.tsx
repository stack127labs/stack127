"use client";

import { ExternalLink, RadioTower } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import type { ZigbeeDevice } from "@/lib/zigbee-devices";
import { zigbeeCategoryLabels } from "@/lib/zigbee-devices";
import styles from "./zigbee-devices.module.css";

function formatList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "Not published in source";
}

function categoryLabel(value: string) {
  return zigbeeCategoryLabels.get(value) ?? "Other";
}

function compatibility(device: ZigbeeDevice) {
  if (device.card?.compatibility) return device.card.compatibility;
  return { label: "Works with", status: "confirmed", value: "Zigbee2MQTT + ZHA" } as const;
}

function cardFacts(device: ZigbeeDevice) {
  return device.card?.facts ?? [
    { label: "Type", value: categoryLabel(device.category) },
    { label: "Capabilities", value: formatList(device.zigbee2mqtt_capabilities.slice(0, 4)) },
  ];
}

function DeviceDetails({ device, onClose }: { device: ZigbeeDevice; onClose: () => void }) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
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

  const handleClose = (event: MouseEvent | PointerEvent) => {
    event.stopPropagation();
    onClose();
  };
  const support = compatibility(device);
  const sections = device.detail_sections ?? [
    { heading: "Exact device", facts: [{ label: "Manufacturer", value: device.vendor }, { label: "Retail model", value: device.model }, { label: "Category", value: categoryLabel(device.category) }] },
    { heading: "Platform compatibility", facts: [{ label: "Zigbee2MQTT", value: device.zigbee2mqtt_url ? "Support record available" : "Not listed" }, { label: "ZHA", value: device.blakadder_url ? "Community record available" : "Not listed" }] },
    { heading: "Exposed features", facts: [{ label: "Zigbee2MQTT fields", value: formatList(device.zigbee2mqtt_capabilities) }, { label: "ZHA reported features", value: formatList(device.zha_reported_capabilities) }] },
  ];

  return (
    <div className="app-detail-overlay" onClick={onClose} onPointerDown={onClose}>
      <aside
        aria-label={`${device.vendor} ${device.model} support details`}
        aria-modal="true"
        className="app-detail-panel app-detail-panel-overlay"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        ref={panelRef}
        role="dialog"
      >
        <div className="app-detail-heading">
          <span aria-hidden="true" className="app-detail-icon"><RadioTower /></span>
          <div><h2>{device.name}</h2><p className={styles.detailModel}>{device.vendor} · {device.model}</p></div>
          <button aria-label="Close device details" className="app-detail-close" onClick={handleClose} onPointerDown={handleClose} type="button">×</button>
        </div>

        <div className={styles.detailImageFrame}>
          <Image alt={`${device.vendor} ${device.model}`} className={styles.detailImage} height={440} src={device.image_path} unoptimized width={440} />
        </div>

        <div className={styles.compatibilityDecision}>
          <span>{support.label}</span>
          <strong>{support.value}</strong>
        </div>

        {sections.map((section) => (
          <section className={styles.factSection} key={section.heading}>
            <h3>{section.heading}</h3>
            <dl>
              {section.facts.map((fact, index) => (
                <div key={`${fact.label}-${index}`}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>
              ))}
            </dl>
          </section>
        ))}

        <section className={styles.factSection}>
          <h3>Identifiers</h3>
          <dl>
            <div><dt>Zigbee model</dt><dd>{formatList(device.zigbee_models)}</dd></div>
            <div><dt>Fingerprint</dt><dd>{device.fingerprints.length > 0 ? device.fingerprints.map((item) => [item.manufacturer_name, item.model_id].filter(Boolean).join(" / ")).join(", ") : "Not published in source"}</dd></div>
            <div><dt>Added</dt><dd>{device.date_added ?? "Date not published"}</dd></div>
          </dl>
        </section>

        <div className="app-detail-primary-links">
          {device.amazon ? <a className="primary" href={device.amazon.url} rel="sponsored noreferrer" target="_blank"><span>Check price on Amazon</span><ExternalLink aria-hidden="true" size={14} /></a> : null}
          {device.zigbee2mqtt_url ? <a className={device.amazon ? undefined : "primary"} href={device.zigbee2mqtt_url} rel="noreferrer" target="_blank"><span>Zigbee2MQTT record</span><ExternalLink aria-hidden="true" size={14} /></a> : null}
          {device.blakadder_url ? <a href={device.blakadder_url} rel="noreferrer" target="_blank"><span>Community compatibility record</span><ExternalLink aria-hidden="true" size={14} /></a> : null}
          <a href={device.image_source_url} rel="noreferrer" target="_blank"><span>Image source</span><ExternalLink aria-hidden="true" size={14} /></a>
        </div>
      </aside>
    </div>
  );
}

function DeviceCard({ device, onSelect }: { device: ZigbeeDevice; onSelect: (trigger: HTMLButtonElement) => void }) {
  const support = compatibility(device);
  return (
    <button aria-label={`View details for ${device.vendor} ${device.model}`} className={`directory-card ${styles.card}`} onClick={(event) => onSelect(event.currentTarget)} type="button">
      <div className={styles.cardImageFrame}>
        <Image alt={`${device.vendor} ${device.model}`} className={styles.cardImage} height={440} loading="lazy" sizes="(max-width: 650px) calc(100vw - 44px), (max-width: 900px) 50vw, 310px" src={device.image_path} unoptimized width={440} />
      </div>
      <div className={styles.cardIdentity}>
        <p>{device.vendor}</p>
        <h2>{device.name}</h2>
        <code>{device.model}</code>
      </div>
      <div className={styles.cardDecision}>
        <span>{support.label}</span>
        <strong>{support.value}</strong>
      </div>
      <dl className={styles.cardFacts}>
        {cardFacts(device).map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
      </dl>
    </button>
  );
}

export function ZigbeeDeviceBrowser({ devices }: { devices: ZigbeeDevice[] }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const selectedDevice = useMemo(() => devices.find((device) => device.slug === selectedSlug), [devices, selectedSlug]);
  const close = () => {
    setSelectedSlug(null);
    requestAnimationFrame(() => openerRef.current?.focus());
  };
  return (
    <>
      <div className="directory-card-grid">
        {devices.map((device) => <DeviceCard device={device} key={device.slug} onSelect={(trigger) => { openerRef.current = trigger; setSelectedSlug(device.slug); }} />)}
      </div>
      {selectedDevice ? <DeviceDetails device={selectedDevice} onClose={close} /> : null}
    </>
  );
}
