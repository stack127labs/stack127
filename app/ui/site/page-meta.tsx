import { CalendarDays, Tag } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import styles from "./page-meta.module.css";

const updatedDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export type PageMetaAuthor = {
  name: string;
  avatarUrl?: string | null;
};

// One metadata line for every page family. Each item shows only when the page has it.
export function PageMeta({
  author,
  githubUrl,
  updatedAt,
  version,
}: {
  author?: PageMetaAuthor | null;
  githubUrl?: string | null;
  updatedAt?: Date | string | null;
  version?: string | null;
}) {
  const updated = updatedAt ? new Date(updatedAt) : null;
  const hasUpdated = updated !== null && !Number.isNaN(updated.getTime());

  if (!author && !githubUrl && !version && !hasUpdated) {
    return null;
  }

  return (
    <div className={styles.meta}>
      {author ? (
        <span className={styles.item}>
          {author.avatarUrl ? (
            <img
              alt=""
              className={styles.avatar}
              decoding="async"
              height="20"
              loading="lazy"
              referrerPolicy="no-referrer"
              src={author.avatarUrl}
              width="20"
            />
          ) : null}
          By {author.name}
        </span>
      ) : null}
      {githubUrl ? (
        <a
          aria-label="GitHub repository"
          className={styles.item}
          href={githubUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          <FaGithub aria-hidden="true" size={15} />
          GitHub
        </a>
      ) : null}
      {version ? (
        <span className={styles.item}>
          <Tag aria-hidden="true" size={15} strokeWidth={1.8} />
          Version {version}
        </span>
      ) : null}
      {hasUpdated ? (
        <span className={styles.item}>
          <CalendarDays aria-hidden="true" size={15} strokeWidth={1.8} />
          <time dateTime={updated.toISOString()}>Updated {updatedDateFormatter.format(updated)}</time>
        </span>
      ) : null}
    </div>
  );
}
