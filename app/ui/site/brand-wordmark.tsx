import styles from "./brand-wordmark.module.css";

type BrandWordmarkProps = {
  className?: string;
};

export function BrandWordmark({ className }: BrandWordmarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.root}${className ? ` ${className}` : ""}`}
    >
      <img
        alt=""
        className={`${styles.image} ${styles.onDark}`}
        decoding="async"
        fetchPriority="high"
        height="282"
        loading="eager"
        src="/logos/stack127-wordmark-on-dark.png"
        width="1451"
      />
      <img
        alt=""
        className={`${styles.image} ${styles.onLight}`}
        decoding="async"
        height="282"
        loading="lazy"
        src="/logos/stack127-wordmark-on-light.png"
        width="1451"
      />
    </span>
  );
}
