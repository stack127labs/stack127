import { ArrowUpRight } from "lucide-react";
import { labProjects as projects } from "./projects";
import { FaGithub } from "react-icons/fa6";
import { InfoPage } from "@/app/ui/site/info-page";
import { siteSpotLabsArt } from "@/app/(site)/art/site--spot-labs";
import styles from "./labs.module.css";

export default function LabsPage() {
  return (
    <InfoPage
      heading={
        <>
          Open projects from <mark>stack127 Labs</mark>
        </>
      }
      heroArt={siteSpotLabsArt}
      intro={
        <p>
          stack127 Labs is the public workshop behind the site, with small projects you can use and
          inspect.
        </p>
      }
      slug="labs"
      title="Labs"
      wide
    >
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
