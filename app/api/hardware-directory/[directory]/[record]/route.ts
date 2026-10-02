import { NextResponse } from "next/server";
import { addAmazonMatches } from "@/lib/amazon-affiliate/server";
import { getHardwareDirectorySnapshot, isHardwareDirectorySlug } from "@/lib/hardware-directories";
import { getPublishedPage } from "@/lib/page-registry";
import { getZigbeeDevices } from "@/lib/zigbee-devices";

export async function GET(_request: Request, { params }: { params: Promise<{ directory: string; record: string }> }) {
  const { directory, record } = await params;
  if ((!isHardwareDirectorySlug(directory) && directory !== "zigbee-devices") || !await getPublishedPage(directory)) {
    return NextResponse.json({ error: "Directory not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const records = directory === "zigbee-devices"
    ? getZigbeeDevices()
    : (await getHardwareDirectorySnapshot(directory)).records;
  const found = records.find((item) => item.slug === record);
  const detail = found && directory === "zigbee-devices"
    ? (await addAmazonMatches(directory, [found]))[0]
    : found;
  if (!detail) {
    return NextResponse.json({ error: "Device not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json(detail, {
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate, s-maxage=86400",
      "Cache-Tag": `stack127-public,page:${directory},page:api:hardware-directory:${directory}:${record}`,
    },
  });
}
