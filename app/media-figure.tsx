import type { CSSProperties, ReactNode } from "react";
import styles from "./media-figure.module.css";

type MediaFigureBase = {
  caption?: ReactNode;
  className?: string;
};

type ImageMediaFigureProps = MediaFigureBase & {
  alt: string;
  decoding?: "async" | "auto" | "sync";
  height: number;
  kind: "image";
  loading?: "eager" | "lazy";
  maxHeight?: string;
  src: string;
  title?: string;
  width: number;
};

type DiagramMediaFigureProps = MediaFigureBase & {
  kind: "diagram";
  svg: string;
};

export type MediaFigureProps = ImageMediaFigureProps | DiagramMediaFigureProps;

export function MediaFigure(props: MediaFigureProps) {
  const className = [
    styles.figure,
    props.kind === "image" ? styles.image : styles.diagram,
    props.className,
  ]
    .filter(Boolean)
    .join(" ");

  if (props.kind === "image") {
    const style = props.maxHeight
      ? ({ "--media-max-height": props.maxHeight } as CSSProperties)
      : undefined;

    return (
      <figure className={className}>
        <img
          alt={props.alt}
          decoding={props.decoding ?? "async"}
          height={props.height}
          loading={props.loading ?? "lazy"}
          src={props.src}
          style={style}
          title={props.title}
          width={props.width}
        />
        {props.caption ? <figcaption>{props.caption}</figcaption> : null}
      </figure>
    );
  }

  return (
    <figure className={className}>
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: props.svg }} />
      {props.caption ? <figcaption>{props.caption}</figcaption> : null}
    </figure>
  );
}
