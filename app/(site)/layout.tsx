import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  buildRegistryMetadata,
  buildRegistryPageStructuredData,
  getPagePublicationState,
} from "@/lib/page-registry";
import { JsonLd } from "../json-ld";

const DEVELOPMENT_ONLY_PATHS = new Set(["/tool-ui-lab", "/app-card-lab"]);

async function requestPublicationState() {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-stack127-pathname") ?? "/";
  const hasQueryParams = requestHeaders.get("x-stack127-has-query") === "1";

  if (process.env.NODE_ENV === "development" && DEVELOPMENT_ONLY_PATHS.has(pathname)) {
    return null;
  }

  return getPagePublicationState(pathname, hasQueryParams);
}

export async function generateMetadata(): Promise<Metadata> {
  const state = await requestPublicationState();

  if (!state) {
    return {
      robots: { follow: false, index: false },
      title: (await headers()).get("x-stack127-pathname") === "/app-card-lab"
        ? "App cards"
        : "Tool components",
    };
  }

  return buildRegistryMetadata(state);
}

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publicationState = await requestPublicationState();

  if (!publicationState) {
    return children;
  }

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
