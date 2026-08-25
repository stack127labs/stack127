import { ArrowUpRight, Binary, Database, Network, type LucideIcon } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { InfoPage } from "../../info-page";
import { proseLedeClassName } from "../../prose";
import styles from "./labs.module.css";

type LabProject = {
  description: string;
  icon: LucideIcon;
  kind: string;
  name: string;
  repository: string;
  website: string;
};

const projects: LabProject[] = [
  {
    name: "BaseBuddy",
    kind: "learning tool",
    description: "A visual base-conversion tool for learning and checking number systems.",
    icon: Binary,
    website: "https://basebuddy.stack127.com",
    repository: "https://github.com/stack127labs/basebuddy",
  },
  {
    name: "DNS tools",
    kind: "open utilities",
    description: "The open-source DNS utilities that power stack127's DNS collection.",
    icon: Network,
    website: "https://stack127.com/dns-tools",
    repository: "https://github.com/stack127labs/dns-tools",
  },
  {
    name: "stack127 datasets",
    kind: "public datasets",
    description: "Versioned public data exports used by stack127 directories and tools.",
    icon: Database,
    website: "https://stack127.com/self-host-apps",
    repository: "https://github.com/stack127labs/stack127-datasets",
  },
];

export default function LabsPage() {
  return (
    <InfoPage
      heading={
        <>
          Open projects from <mark>stack127 Labs</mark>
        </>
      }
      slug="labs"
      title="Labs"
      wide
    >
      <p className={proseLedeClassName}>
        stack127 Labs is the public workshop behind the site. These projects are small,
        independently useful, and open to inspect.
      </p>

      <section className={styles.projectSection}>
        <h2>Three projects you can use or inspect</h2>
        <div className={styles.ledger}>
          <table className={styles.projects}>
            <colgroup>
              <col className={styles.projectColumn} />
              <col />
              <col className={styles.actionColumn} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Project</th>
                <th scope="col">What it does</th>
                <th scope="col">Go there</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const ProjectIcon = project.icon;

                return (
                  <tr key={project.name}>
                    <th scope="row">
                      <span className={styles.projectIdentity}>
                        <span className={styles.projectIcon}>
                          <ProjectIcon aria-hidden="true" size={24} strokeWidth={2} />
                        </span>
                        <span className={styles.projectName}>
                          <strong>{project.name}</strong>
                          <span>{project.kind}</span>
                        </span>
                      </span>
                    </th>
                    <td className={styles.description}>{project.description}</td>
                    <td>
                      <span className={styles.actions}>
                        <a aria-label={`Open ${project.name}`} href={project.website}>
                          Open project
                          <ArrowUpRight aria-hidden="true" size={15} strokeWidth={2.2} />
                        </a>
                        <a
                          aria-label={`View ${project.name} source code`}
                          href={project.repository}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Source code
                          <FaGithub aria-hidden="true" size={14} />
                        </a>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.githubSection}>
        <h2>Public work stays easy to inspect</h2>
        <div className={styles.organization}>
          <span className={styles.organizationIcon}>
            <FaGithub aria-hidden="true" size={28} />
          </span>
          <p>
            The GitHub organization holds every public project.
          </p>
          <a
            className={styles.organizationLink}
            href="https://github.com/stack127labs"
            rel="noreferrer"
            target="_blank"
          >
            Browse all public projects
            <ArrowUpRight aria-hidden="true" size={16} strokeWidth={2.2} />
          </a>
        </div>
      </section>
    </InfoPage>
  );
}
