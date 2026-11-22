import Link from "next/link";
import { cardArt } from "@/lib/card-art";
import { cardIcon } from "@/lib/card-icons";
import { Doodle } from "@/app/ui/site/doodle";
import { intentPrefetch } from "@/app/ui/site/intent-prefetch";
import styles from "./course-card.module.css";

export type CourseCardData = {
  slug: string;
  card_name: string;
  card_description: string;
  card_icon_key: string | null;
  card_art_key: string | null;
};

/** A course's wide homepage card: art beside the name, description, and lesson count. */
export function CourseCard({ page, lessons }: { page: CourseCardData; lessons: number }) {
  const Icon = cardIcon(page.card_icon_key ?? page.slug);
  const art = cardArt(page.card_art_key);
  return (
    <Link {...intentPrefetch} className={styles.card} href={`/${page.slug}`}>
      {art ? (
        <span aria-hidden="true" className={styles.art}>
          <Doodle className={styles.doodle} svg={art} />
        </span>
      ) : null}
      <div className={styles.copy}>
        <h3 className={styles.title}>
          <span aria-hidden="true" className={styles.icon}><Icon size={18} strokeWidth={2.2} /></span>
          {page.card_name}
        </h3>
        <p className={styles.description}>{page.card_description}</p>
        <p className={styles.meta}>
          <span>{lessons.toLocaleString("en-US")} {lessons === 1 ? "lesson" : "lessons"}</span>
          <span aria-hidden="true" className={styles.start}>start the course →</span>
        </p>
      </div>
    </Link>
  );
}
