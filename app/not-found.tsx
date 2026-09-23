import { PageCanvas } from "@/app/ui/site/page-canvas";
import Link from "next/link";
import { siteDoodleSparkArt } from "./(site)/art/site--doodle-spark";
import { AppShell } from "./ui/site/app-shell";
import { Doodle } from "./ui/site/doodle";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <AppShell mainLabel="Not found" sidebarLabel="Not found sidebar">
      <PageCanvas as="div" flow className={styles.panel}>
        <Doodle svg={siteDoodleSparkArt} />
        <p>404</p>
        <h1>Page not found</h1>
        <Link href="/">Explore stack127</Link>
      </PageCanvas>
    </AppShell>
  );
}
