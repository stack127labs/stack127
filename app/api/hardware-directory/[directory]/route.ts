import { NextResponse } from "next/server";
import { addAmazonMatches } from "@/lib/amazon-affiliate/server";
import { getHardwareDirectorySnapshot, isHardwareDirectorySlug } from "@/lib/hardware-directories";
import { hardwareIndexRecord } from "@/lib/hardware-directories/search-index";
import { getPublishedPage } from "@/lib/page-registry";
import { getZigbeeDevices, zigbeeCategoryLabels } from "@/lib/zigbee-devices";
import { zigbeeIndexRecord } from "@/lib/zigbee-devices/search-index";

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

const directories = ["nut-compatible-ups", "local-security-cameras", "matter-devices", "z-wave-devices", "zigbee-devices"];

export function generateStaticParams() {
  return directories.map((directory) => ({ directory }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ directory: string }> }) {
  const { directory } = await params;
  if (!directories.includes(directory) || !await getPublishedPage(directory)) {
    return NextResponse.json({ error: "Directory not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  let records;
  if (directory === "zigbee-devices") {
    const devices = await addAmazonMatches(directory, getZigbeeDevices());
    records = devices.map((device) => zigbeeIndexRecord(device, zigbeeCategoryLabels));
  } else if (isHardwareDirectorySlug(directory)) {
    const snapshot = await getHardwareDirectorySnapshot(directory);
    records = snapshot.records.map(hardwareIndexRecord);
  } else {
    throw new Error(`Missing directory index loader for ${directory}.`);
  }

  return NextResponse.json(records, {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate, s-maxage=31536000",
      "Cache-Tag": `stack127-public,page:${directory},page:api:hardware-directory:${directory}`,
    },
  });
}
