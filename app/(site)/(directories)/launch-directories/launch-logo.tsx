"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./launch-directories.module.css";

/** The place's square icon on a light plate, or its first letter when there is no icon or it fails. */
export function LaunchLogo({ eager = false, iconUrl, name, size = "card" }: {
  eager?: boolean;
  iconUrl: string | null;
  name: string;
  size?: "row" | "card" | "title";
}) {
  const [failed, setFailed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // An image can fail before hydration attaches onError, so check once after mount.
  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth === 0) setFailed(true);
  }, [iconUrl]);

  const pixels = size === "title" ? 48 : size === "card" ? 36 : 22;
  return <span aria-hidden="true" className={styles.logo} data-size={size}>
    {iconUrl && !failed
      ? <img
        alt=""
        decoding="async"
        height={pixels}
        loading={eager ? "eager" : "lazy"}
        onError={() => setFailed(true)}
        ref={imageRef}
        src={iconUrl}
        width={pixels}
      />
      : <span>{name.slice(0, 1)}</span>}
  </span>;
}
