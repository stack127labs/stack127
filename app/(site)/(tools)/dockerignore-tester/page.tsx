import { FileSearch } from "lucide-react";
import { AppShell } from "../../../app-shell";
import { PageTitleIcon } from "../../../page-title-icon";
import { DockerignoreGuide } from "./dockerignore-guide";
import { DockerignoreTester } from "./dockerignore-tester";
import styles from "./dockerignore-tester.module.css";

export default function DockerignoreTesterPage() {
  return (
    <AppShell mainLabel=".dockerignore pattern tester">
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <h1 aria-label=".dockerignore Pattern Tester: see which rule decides each path">
            <PageTitleIcon>
              <FileSearch strokeWidth={2.2} />
            </PageTitleIcon>{" "}
            .dockerignore Pattern Tester: see which rule <mark>decides each path</mark>
          </h1>
          <p>
            Paste the .dockerignore file Docker will use and a list of context-relative paths. You
            get an Included or Excluded verdict, the deciding line, and the full rule trace in your
            browser. These are path probes, not a filesystem scan or Docker build.
          </p>
        </header>
        <DockerignoreTester />
        <DockerignoreGuide />
      </div>
    </AppShell>
  );
}
