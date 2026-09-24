import { NextResponse } from "next/server";
import { getHardwareDirectorySnapshot, isHardwareDirectorySlug } from "@/lib/hardware-directories";
import { getPublishedPage } from "@/lib/page-registry";

export async function GET(_request: Request, { params }: { params: Promise<{ directory: string; record: string }> }) {
  const { directory, record } = await params;
  if (!isHardwareDirectorySlug(directory) || !await getPublishedPage(directory)) {
    return NextResponse.json({ error: "Directory not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const snapshot = await getHardwareDirectorySnapshot(directory);
  const detail = snapshot.records.find((item) => item.slug === record);
  if (!detail) {
    return NextResponse.json({ error: "Device not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json(detail, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" },
  });
}
