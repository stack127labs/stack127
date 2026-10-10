"use client";

import { DetailDialog, DetailDialogClose } from "@/app/ui/detail-dialog";
import { ExternalLink, RadioTower } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { ZigbeeDevice } from "@/lib/zigbee-devices";
import { hardwareCardName } from "@/lib/hardware-directories/card-name";
import type { ZigbeeIndexRecord } from "./filters";
import styles from "./zigbee-devices.module.css";
import { HardwareFactCardContent, hardwareFactCardClassName } from "../../../ui/directories/hardware-fact-card";

function formatList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "Not listed";
}

function FactValue({ value }: { value: string }) {
  return value.length > 220
    ? <details className={styles.longFact}><summary>Show list</summary><p>{value}</p></details>
    : value;
}

function readerFactValue(value: string) {
  if (/^(support|community) record available$/i.test(value)) return "Listed";
  return value;
}

function DeviceDetails({ categoryLabels, device, onClose }: { categoryLabels: Record<string, string>; device: ZigbeeDevice; onClose: () => void }) {
  const categoryLabel = (value: string) => categoryLabels[value] ?? "Other";
  const support = device.card?.compatibility ?? { label: "Works with", status: "confirmed", value: "Zigbee2MQTT + ZHA" };
  const sections = device.detail_sections ?? [
    { heading: "Exact device", facts: [{ label: "Manufacturer", value: device.vendor }, { label: "Retail model", value: device.model }, { label: "Category", value: categoryLabel(device.category) }] },
    { heading: "Platform compatibility", facts: [{ label: "Zigbee2MQTT", value: device.zigbee2mqtt_url ? "Support record available" : "Not listed" }, { label: "Blakadder", value: device.blakadder_url ? "Community record available" : "Not listed" }] },
    { heading: "Exposed features", facts: [{ label: "Zigbee2MQTT fields", value: formatList(device.zigbee2mqtt_capabilities) }, { label: "Blakadder reported features", value: formatList(device.zha_reported_capabilities) }] },
  ];
  const visibleSections = sections
    .map((section) => ({
      ...section,
      facts: section.facts.filter((fact) =>
        !/^controller listings$/i.test(fact.label)
        && !/^zigbee model ids$/i.test(fact.label)
        && !(fact.label === "Description" && fact.value === device.name)
        && !/\bnot published\b|^date not published$/i.test(fact.value.trim()),
      ),
    }))
    .filter((section) => section.facts.length > 0);
  const identifierFacts = [
    ...(device.zigbee_models.length > 0 ? [{ label: "Zigbee model", value: formatList(device.zigbee_models) }] : []),
    ...(device.fingerprints.length > 0 ? [{ label: "Fingerprint", value: device.fingerprints.map((item) => [item.manufacturer_name, item.model_id].filter(Boolean).join(" / ")).join(", ") }] : []),
  ];

  return (
    <DetailDialog ariaLabel={`${device.vendor} ${device.model} support details`} onClose={onClose}>
        <div className="app-detail-heading">
          <span aria-hidden="true" className="app-detail-icon"><RadioTower /></span>
          <div><h2>{device.name}</h2><p className={styles.detailModel}>{device.vendor} · {device.model}</p></div>
          <DetailDialogClose ariaLabel="Close device details" onClose={onClose} />
        </div>

        <div className={styles.detailImageFrame}>
          <Image alt={`${device.vendor} ${device.model}`} className={styles.detailImage} height={440} src={device.image_path} unoptimized width={440} />
        </div>

        <div className={styles.compatibilityDecision}>
          <span>{support.label}</span>
          <strong>{support.value}</strong>
        </div>

        {visibleSections.map((section) => (
          <section className={styles.factSection} key={section.heading}>
            <h3>{section.heading}</h3>
            <dl>
              {section.facts.map((fact, index) => (
                <div key={`${fact.label}-${index}`}><dt>{fact.label}</dt><dd><FactValue value={readerFactValue(fact.value)} /></dd></div>
              ))}
            </dl>
          </section>
        ))}

        {identifierFacts.length > 0 ? <section className={styles.factSection}>
          <h3>Device identifiers</h3>
          <dl>{identifierFacts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd><FactValue value={fact.value} /></dd></div>)}</dl>
        </section> : null}

        {device.image_source_url ? <p className={styles.imageCredit}><a href={device.image_source_url} rel="noreferrer" target="_blank">Image credit</a></p> : null}

        <div className="app-detail-primary-links">
          {device.amazon ? <a className="primary" href={device.amazon.url} rel="sponsored noreferrer" target="_blank"><span>Check price on Amazon</span><ExternalLink aria-hidden="true" size={14} /></a> : null}
          {device.zigbee2mqtt_url ? <a className={device.amazon ? undefined : "primary"} href={device.zigbee2mqtt_url} rel="noreferrer" target="_blank"><span>Zigbee2MQTT support</span><ExternalLink aria-hidden="true" size={14} /></a> : null}
          {device.blakadder_url ? <a href={device.blakadder_url} rel="noreferrer" target="_blank"><span>Blakadder community report</span><ExternalLink aria-hidden="true" size={14} /></a> : null}
        </div>
      </DetailDialog>
  );
}

function DeviceCard({ device, onSelect }: { device: ZigbeeIndexRecord; onSelect: () => void }) {
  const support = device.compatibility;
  return (
    <button aria-label={`View details for ${device.vendor} ${device.model}`} aria-haspopup="dialog" className={`directory-card ${hardwareFactCardClassName}`} onClick={onSelect} type="button">
      <HardwareFactCardContent name={hardwareCardName(device.name, device.vendor, device.model)} image={device.image_path}
        facts={[{ label: support.label, value: support.value }, ...device.cardFacts]} />
    </button>
  );
}

// The first page ships its full device records. Cards that only appear after
// filtering load their details when opened.
export function ZigbeeDeviceBrowser({ categoryLabels, details, devices }: {
  categoryLabels: Record<string, string>;
  details: ZigbeeDevice[];
  devices: ZigbeeIndexRecord[];
}) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [loadedBySlug, setLoadedBySlug] = useState<Record<string, ZigbeeDevice>>({});
  const [loadError, setLoadError] = useState(false);
  const selectedDevice = selectedSlug ? details.find((device) => device.slug === selectedSlug) ?? loadedBySlug[selectedSlug] : undefined;

  useEffect(() => {
    if (!selectedSlug || selectedDevice) return;
    const controller = new AbortController();
    setLoadError(false);
    fetch(`/api/hardware-directory/zigbee-devices/${encodeURIComponent(selectedSlug)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Device details could not be loaded.");
        return response.json() as Promise<ZigbeeDevice>;
      })
      .then((device) => setLoadedBySlug((current) => ({ ...current, [device.slug]: device })))
      .catch(() => { if (!controller.signal.aborted) setLoadError(true); });
    return () => controller.abort();
  }, [selectedDevice, selectedSlug]);

  const close = () => { setSelectedSlug(null); setLoadError(false); };
  return (
    <>
      <div className="directory-card-grid">
        {devices.map((device) => <DeviceCard device={device} key={device.slug} onSelect={() => setSelectedSlug(device.slug)} />)}
      </div>
      {selectedDevice ? <DeviceDetails categoryLabels={categoryLabels} device={selectedDevice} onClose={close} /> : null}
      {selectedSlug && !selectedDevice ? <DetailDialog ariaLabel="Device details" onClose={close}>
        <div className="app-detail-heading"><h2>Device details</h2><DetailDialogClose ariaLabel="Close device details" onClose={close} /></div>
        <p role={loadError ? "alert" : "status"}>{loadError ? "Device details could not be loaded. Close this panel and try again." : "Loading device details…"}</p>
      </DetailDialog> : null}
    </>
  );
}
