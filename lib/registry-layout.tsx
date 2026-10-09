import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { cache } from "react";
import { buildRegistryMetadata, getRegistryPageStructuredData, getPagePublicationState } from "./page-registry";
import { JsonLd } from "@/app/ui/site/json-ld";
import { siteStructuredData } from "./seo";

type Props = { children?: ReactNode; params?: Promise<Record<string, string | string[]>> };
const stateForPath = cache(async (pathname: string) => {
  if (process.env.NODE_ENV === "development" && (pathname === "/components-ui" || pathname.startsWith("/components-ui/"))) return null;
  return getPagePublicationState(pathname);
});

/** Structured data for one exact path. Index pages under a shared parent layout render it themselves. */
export async function RegistryStructuredData({ path }: { path: string }) {
  const state = await stateForPath(path);
  const data = state ? await getRegistryPageStructuredData(state) : null;
  return data ? <><JsonLd data={siteStructuredData} /><JsonLd data={data} /></> : null;
}

/**
 * Publication and SEO stay registry-owned; route layouts supply only their path.
 * A layout with child pages passes `structuredData: "page"`, because layout output would also reach child URLs.
 */
export function registryLayout(template: string, { structuredData = "layout" }: { structuredData?: "layout" | "page" } = {}) {
  const pathname = async (props: Props) => {
    const params = template.includes("[") ? await props.params : {};
    return template.replace(/\[(?:\.\.\.)?([^\]]+)\]/g, (_, key: string) => {
      const value = params?.[key];
      return Array.isArray(value) ? value.join("/") : value ?? "";
    });
  };
  return {
    generateMetadata: async (props: Props): Promise<Metadata> => {
      const state = await stateForPath(await pathname(props));
      return state ? buildRegistryMetadata(state) : { title: "Components UI", robots: { index: false, follow: false } };
    },
    Layout: async (props: Props) => {
      const state = await stateForPath(await pathname(props));
      if (!state) return props.children;
      if (state.kind === "missing") notFound();
      if (structuredData === "page") return props.children;
      const data = await getRegistryPageStructuredData(state);
      return <>{data ? <><JsonLd data={siteStructuredData} /><JsonLd data={data} /></> : null}{props.children}</>;
    },
  };
}
