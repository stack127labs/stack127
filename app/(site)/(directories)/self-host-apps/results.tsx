"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Pagination } from "@/app/ui/pagination";
import { StatePanel } from "@/app/ui/state-panel";
import { pageParamHref } from "@/app/ui/directories/directory-params";
import { DirectoryAppBrowser } from "./directory-app-browser";
import { ActiveFilters } from "./filters";
import { route } from "./options";
import { useSelfHostAppsSearch } from "./search";
import styles from "./results.module.css";

export function SelfHostAppResults({ emptyVisual }: { emptyVisual: ReactNode }) {
  const { params, results, retry, status } = useSelfHostAppsSearch();
  const showAll = <Link href={route}>show all apps</Link>;

  let content;
  if (status === "invalid") {
    content = (
      <StatePanel action={showAll} state="error" title="Those filters could not be used">
        <p>The link may be from an older version of this page. Clear the filters and pick them again.</p>
      </StatePanel>
    );
  } else if (status === "error") {
    content = (
      <StatePanel action={<button onClick={retry} type="button">try again</button>} state="error" title="Apps could not be loaded">
        <p>Check your connection and try again.</p>
      </StatePanel>
    );
  } else if (results.apps.length === 0) {
    content = status === "loading" ? <StatePanel state="loading" title="Loading apps" /> : (
      <StatePanel action={showAll} title="No apps match those filters" visual={emptyVisual}>
        <p>Try clearing one filter first.</p>
      </StatePanel>
    );
  } else {
    content = (
      <>
        <DirectoryAppBrowser apps={results.apps} details={results.detailApps} />
        {results.totalPages > 1 ? (
          <Pagination
            ariaLabel="Self-hosted app pages"
            currentPage={results.currentPage}
            hrefForPage={(page) => pageParamHref(route, params, page)}
            totalPages={results.totalPages}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <ActiveFilters />
      <div aria-busy={status === "loading" || undefined} className={styles.results}>
        {content}
      </div>
    </>
  );
}
