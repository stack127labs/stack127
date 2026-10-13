"use client";

import { useInitialQuery } from "@/app/ui/tools/use-initial-query";
import { IsbnBarcodeGenerator, inputFromQuery, isSharedLink } from "./isbn-barcode-generator";

// Reads a shared link in the browser so the page stays static. A clean URL, or one with only
// other parameters such as tracking tags, opens on the example and leaves the address alone.
export function IsbnBarcodeGeneratorFromUrl() {
  const query = useInitialQuery();
  const shared = isSharedLink(query.get);
  return <IsbnBarcodeGenerator initialInput={shared ? inputFromQuery(query.get) : undefined} key={query.key} />;
}
