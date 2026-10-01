import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import { buildRegistryMetadata, getRegistryPageStructuredData, getPagePublicationState } from "./page-registry";
import { JsonLd } from "@/app/ui/site/json-ld";

type Props = { children?: ReactNode; params?: Promise<Record<string, string | string[]>> };
const stateForPath = cache(async (pathname: string, requestAware: boolean) => {
  if (process.env.NODE_ENV === "development" && pathname === "/components-ui") return null;
  return getPagePublicationState(pathname, requestAware && (await headers()).get("x-stack127-has-query") === "1");
});

/** Publication and SEO stay registry-owned; route layouts supply only their path. */
export function registryLayout(template: string, requestAware = false) {
  const pathname = async (props: Props) => {
    const params = template.includes("[") ? await props.params : {};
    return template.replace(/\[(?:\.\.\.)?([^\]]+)\]/g, (_, key: string) => {
      const value = params?.[key];
      return Array.isArray(value) ? value.join("/") : value ?? "";
    });
  };
  return {
    generateMetadata: async (props: Props): Promise<Metadata> => {
      const state = await stateForPath(await pathname(props), requestAware);
      return state ? buildRegistryMetadata(state) : { title: "Components UI", robots: { index: false, follow: false } };
    },
    Layout: async (props: Props) => {
      const state = await stateForPath(await pathname(props), requestAware);
      if (!state) return props.children;
      if (state.kind === "missing") notFound();
      const data = await getRegistryPageStructuredData(state);
      return <>{data ? <JsonLd data={data} /> : null}{props.children}</>;
    },
  };
}
