import Link from "next/link";
import { AppShell } from "./app-shell";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <AppShell mainLabel="Not found" sidebarLabel="Not found sidebar">
      <div className={styles.panel}>
        <p>404</p>
        <h1>Page not found</h1>
        <Link href="/self-host-apps">Browse apps</Link>
      </div>
    </AppShell>
  );
}
