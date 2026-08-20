import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  buildRegistryMetadata,
  buildRegistryPageStructuredData,
  getPagePublicationState,
} from "@/lib/page-registry";
import { JsonLd } from "../json-ld";

async function requestPublicationState() {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-stack127-pathname") ?? "/";
  const hasQueryParams = requestHeaders.get("x-stack127-has-query") === "1";

  return getPagePublicationState(pathname, hasQueryParams);
}

export async function generateMetadata(): Promise<Metadata> {
  const state = await requestPublicationState();

  return buildRegistryMetadata(state);
}

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publicationState = await requestPublicationState();

  if (publicationState.kind === "missing") {
    notFound();
  }

  const pageStructuredData = buildRegistryPageStructuredData(publicationState);

  return (
    <>
      {pageStructuredData ? <JsonLd data={pageStructuredData} /> : null}
      {children}
    </>
  );
}
