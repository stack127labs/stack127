"use client";

import { DetailDialog, DetailDialogClose } from "@/app/ui/detail-dialog";


import { ExternalLink, RadioTower } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { ZigbeeDevice } from "@/lib/zigbee-devices";
import { zigbeeCategoryLabels } from "@/lib/zigbee-devices";
import styles from "./zigbee-devices.module.css";
import { HardwareFactCardContent, hardwareFactCardClassName, hardwareCardName } from "../../../ui/directories/hardware-fact-card";

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




  const support = compatibility(device);
  const sections = device.detail_sections ?? [
    { heading: "Exact device", facts: [{ label: "Manufacturer", value: device.vendor }, { label: "Retail model", value: device.model }, { label: "Category", value: categoryLabel(device.category) }] },
    { heading: "Platform compatibility", facts: [{ label: "Zigbee2MQTT", value: device.zigbee2mqtt_url ? "Support record available" : "Not listed" }, { label: "ZHA", value: device.blakadder_url ? "Community record available" : "Not listed" }] },
    { heading: "Exposed features", facts: [{ label: "Zigbee2MQTT fields", value: formatList(device.zigbee2mqtt_capabilities) }, { label: "ZHA reported features", value: formatList(device.zha_reported_capabilities) }] },
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
      </DetailDialog>
  );
}

function DeviceCard({ device, onSelect }: { device: ZigbeeDevice; onSelect: () => void }) {
  const support = compatibility(device);
  return (
    <button aria-label={`View details for ${device.vendor} ${device.model}`} aria-haspopup="dialog" className={`directory-card ${hardwareFactCardClassName}`} onClick={onSelect} type="button">
      <HardwareFactCardContent name={hardwareCardName(device.name, device.vendor, device.model)} image={device.image_path}
        facts={[{ label: support.label, value: support.value }, ...cardFacts(device)]} />
    </button>
  );
}

export function ZigbeeDeviceBrowser({ devices }: { devices: ZigbeeDevice[] }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selectedDevice = useMemo(() => devices.find((device) => device.slug === selectedSlug), [devices, selectedSlug]);
  const close = () => setSelectedSlug(null);
  return (
    <>
      <div className="directory-card-grid">
        {devices.map((device) => <DeviceCard device={device} key={device.slug} onSelect={() => setSelectedSlug(device.slug)} />)}
      </div>
      {selectedDevice ? <DeviceDetails device={selectedDevice} onClose={close} /> : null}
    </>
  );
}
