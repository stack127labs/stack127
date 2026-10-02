import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { cache } from "react";
import { buildRegistryMetadata, getRegistryPageStructuredData, getPagePublicationState } from "./page-registry";
import { JsonLd } from "@/app/ui/site/json-ld";

type Props = { children?: ReactNode; params?: Promise<Record<string, string | string[]>> };
const stateForPath = cache(async (pathname: string) => {
  if (process.env.NODE_ENV === "development" && pathname === "/components-ui") return null;
  return getPagePublicationState(pathname);
});

/** Publication and SEO stay registry-owned; route layouts supply only their path. */
export function registryLayout(template: string) {
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
      const data = await getRegistryPageStructuredData(state);
      return <>{data ? <JsonLd data={data} /> : null}{props.children}</>;
    },
  };
}
