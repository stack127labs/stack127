import Link from "next/link";
import { siteDoodleSparkArt } from "./(site)/art/site--doodle-spark";
import { AppShell } from "./app-shell";
import { Doodle } from "./doodle";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <AppShell mainLabel="Not found" sidebarLabel="Not found sidebar">
      <div className={styles.panel}>
        <Doodle svg={siteDoodleSparkArt} />
        <p>404</p>
        <h1>Page not found</h1>
        <Link href="/self-host-apps">Browse apps</Link>
      </div>
    </AppShell>
  );
}
