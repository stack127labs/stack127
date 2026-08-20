import { ExternalLink } from "lucide-react";
import { InfoPage } from "../../info-page";
import { proseLedeClassName } from "../../prose";
import styles from "./labs.module.css";

const projects = [
  {
    name: "BaseBuddy",
    description: "A visual base-conversion tool for learning and checking number systems.",
    website: "https://basebuddy.stack127.com",
    repository: "https://github.com/stack127labs/basebuddy",
  },
  {
    name: "DNS tools",
    description: "The open-source DNS utilities that power stack127's DNS collection.",
    website: "https://stack127.com/dns-tools",
    repository: "https://github.com/stack127labs/dns-tools",
  },
  {
    name: "stack127 datasets",
    description: "Versioned public data exports used by stack127 directories and tools.",
    website: "https://stack127.com/self-host-apps",
    repository: "https://github.com/stack127labs/stack127-datasets",
  },
] as const;

export default function LabsPage() {
  return (
    <InfoPage
      heading={
        <>
          Projects from <mark>stack127 Labs</mark>
        </>
      }
      slug="labs"
      title="Labs"
    >
      <p className={proseLedeClassName}>
        stack127 is the website. stack127 Labs is where the projects behind it live, from
        small utilities to reusable datasets and self-hostable tools.
      </p>

      <section>
        <h2>Current projects</h2>
        <div className={styles.tableWrap}>
          <table className={styles.projects}>
            <thead>
              <tr>
                <th scope="col">Project</th>
                <th scope="col">What it does</th>
                <th scope="col">Links</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.name}>
                  <th scope="row">{project.name}</th>
                  <td>{project.description}</td>
                  <td>
                    <span className={styles.links}>
                      <a href={project.website}>open</a>
                      <a href={project.repository} rel="noreferrer" target="_blank">
                        source <ExternalLink aria-hidden="true" size={13} />
                      </a>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Everything on GitHub</h2>
        <p>
          Browse the complete project list in the{" "}
          <a href="https://github.com/stack127labs" rel="noreferrer" target="_blank">
            stack127labs GitHub organization
          </a>
          . Some source-of-truth repositories stay private while they are under active
          development; public project repositories remain independently usable.
        </p>
      </section>
    </InfoPage>
  );
}
