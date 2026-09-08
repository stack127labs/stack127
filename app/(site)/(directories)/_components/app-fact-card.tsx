import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CategoryIcon } from "@/app/category-icon";
import styles from "./app-fact-card.module.css";

export const appFactCardClassName = styles.card;

type CardCategory = { name: string; icon_key?: string | null };
type CardFact = { label: string; value: string; icon: LucideIcon; estimated?: boolean };

export function AppFactCardContent({
  name, image, categories, summary, facts, status,
}: {
  name: string;
  image: ReactNode;
  categories: CardCategory[];
  summary: string;
  facts: CardFact[];
  status?: ReactNode;
}) {
  const primary = categories[0];
  const more = categories.slice(1);

  return (
    <>
      <div className={styles.identity}>
        <span className={styles.image}>{image}</span>
        <div className={styles.title}>
          <h2>{name}</h2>
          <span className={styles.category} data-card-category>
            <CategoryIcon iconKey={primary?.icon_key} />
            <span>{primary?.name ?? "Uncategorized"}</span>
            {more.length > 0 && (
              <span className={styles.more} data-category-more title={more.map((category) => category.name).join(", ")}>
                +{more.length}
                <span className={styles.srOnly}> more {more.length === 1 ? "category" : "categories"}: {more.map((category) => category.name).join(", ")}</span>
              </span>
            )}
          </span>
          {status}
        </div>
      </div>
      <p className={styles.summary}>{summary}</p>
      <AppCardFacts facts={facts} />
    </>
  );
}

export function AppCardFacts({ facts }: { facts: CardFact[] }) {
  return (
      <dl className={styles.facts} data-card-facts>
        {facts.map(({ label, value, icon: Icon, estimated }) => (
          <div key={label}>
            <dt><Icon aria-hidden="true" size={14} />{label}</dt>
            <dd>{value}{estimated && <span className={styles.estimate}>estimated</span>}</dd>
          </div>
        ))}
      </dl>
  );
}
