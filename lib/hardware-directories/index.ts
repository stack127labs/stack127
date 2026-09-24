import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AmazonProductMatch } from "@/lib/amazon-affiliate";
import { addAmazonMatches } from "@/lib/amazon-affiliate/server";

export type HardwareDirectoryLink = {
  label: string;
  url: string;
};

export type HardwareDirectoryFact = {
  label: string;
  value: string;
};

export type HardwareDirectoryEvidence = {
  label: string;
  value: string;
};

export type HardwareDirectoryStat = {
  label: string;
  value: string;
};

export type HardwareDirectoryCompatibility = {
  label: string;
  status: "confirmed" | "reported" | "limited" | "not-applicable";
  value: string;
};

export type HardwareDirectoryDetailSection = {
  facts: HardwareDirectoryFact[];
  heading: string;
};

export type HardwareDirectoryProvenance = {
  field: string;
  source: string;
  url: string;
};

export type HardwareDirectoryCertificationVariant = {
  certificate_id: string;
  certified_date: string | null;
  firmware_version: string | null;
  hardware_version: string | null;
  matter_version: string | null;
  product_id: string | null;
  source_url: string;
  transport: string | null;
  vendor_id: string | null;
};

export type HardwareDirectoryRecord = {
  added: string | null;
  amazon?: AmazonProductMatch;
  card?: {
    compatibility: HardwareDirectoryCompatibility;
    facts: HardwareDirectoryFact[];
  };
  category: string;
  certification_variant_kind?: "matter" | "z-wave";
  certification_variants?: HardwareDirectoryCertificationVariant[];
  detail_sections?: HardwareDirectoryDetailSection[];
  evidence: HardwareDirectoryEvidence[];
  facts: HardwareDirectoryFact[];
  features: string[];
  image_path: string | null;
  image_source_url: string | null;
  model: string;
  name: string;
  notes: string[];
  provenance?: HardwareDirectoryProvenance[];
  search_terms: string[];
  slug: string;
  source_links: HardwareDirectoryLink[];
  stats: HardwareDirectoryStat[];
  vendor: string;
};

export type HardwareDirectorySnapshot = {
  meta: {
    coverage?: {
      detail_total: number;
      eligible_total: number;
      excluded_total: number;
      failures: Array<{ reason: string; [key: string]: unknown }>;
      image_total: number;
      record_total: number;
      source_total: number;
      [key: string]: unknown;
    };
    generated_at: string;
    ready_for_catalog?: boolean;
    ready_for_publication?: boolean;
    source_label: string;
    source_revision: string;
    source_url: string;
  };
  records: HardwareDirectoryRecord[];
};

const snapshotFiles = {
  "local-security-cameras": "local-security-cameras.json",
  "matter-devices": "matter-devices.json",
  "nut-compatible-ups": "nut-compatible-ups.json",
  "z-wave-devices": "z-wave-devices.json",
  "zigbee-coordinators": "zigbee-coordinators.json",
};

export type HardwareDirectorySlug = keyof typeof snapshotFiles;

export function isHardwareDirectorySlug(slug: string): slug is HardwareDirectorySlug {
  return Object.hasOwn(snapshotFiles, slug);
}

const snapshotPromises = new Map<HardwareDirectorySlug, Promise<HardwareDirectorySnapshot>>();

function readHardwareDirectorySnapshot(slug: HardwareDirectorySlug) {
  let snapshot = snapshotPromises.get(slug);
  if (!snapshot) {
    const file = path.join(process.cwd(), "lib/hardware-directories/data", snapshotFiles[slug]);
    snapshot = readFile(file, "utf8").then((text) => JSON.parse(text) as HardwareDirectorySnapshot);
    snapshotPromises.set(slug, snapshot);
    snapshot.catch(() => snapshotPromises.delete(slug));
  }
  return snapshot;
}

/** Home needs the directory's actual entry count, without affiliate enrichment. */
export async function getHardwareDirectoryCount(slug: HardwareDirectorySlug) {
  return (await readHardwareDirectorySnapshot(slug)).records.length;
}

export async function getHardwareDirectorySnapshot(slug: HardwareDirectorySlug) {
  const snapshot = await readHardwareDirectorySnapshot(slug);
  return { ...snapshot, records: await addAmazonMatches(slug, snapshot.records) };
}
