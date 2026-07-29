import styles from "./doodle.module.css";

/**
 * Renders a decorative marker-art doodle. Unlike MarkerArt figures, doodles
 * carry no information: they are aria-hidden, never framed, and the corner
 * placement disappears below 1100px so decoration never causes clutter.
 * Doodle SVGs are generated from specs in app/(site)/art/ by the marker-art
 * generator; see version127_docs/marker-art.md.
 */
export function Doodle({
  svg,
  placement = "inline",
  className,
}: {
  svg: string;
  placement?: "inline" | "corner";
  className?: string;
}) {
  const base = placement === "corner" ? styles.corner : styles.inline;

  return (
    <span
      aria-hidden="true"
      className={className ? `${base} ${className}` : base}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
