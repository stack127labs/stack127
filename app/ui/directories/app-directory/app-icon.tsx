"use client";

import { useEffect, useRef, useState } from "react";

const letter = (name: string) => name.match(/[A-Za-z0-9]/)?.[0]?.toUpperCase() ?? "?";

/** The app's own icon from public/indie-hacker-apps/icons, or its first letter when there is none. */
export function AppIcon({ app, detail = false }: { app: { name: string; icon: string }; detail?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(!app.icon);
  const imageRef = useRef<HTMLImageElement>(null);

  // A cached image can finish loading before React attaches onLoad.
  useEffect(() => {
    const image = imageRef.current;
    if (image?.complete) {
      if (image.naturalWidth > 0) setLoaded(true);
      else setFailed(true);
    }
  }, []);

  return (
    <span
      aria-hidden="true"
      className={detail ? "app-detail-icon" : "directory-card-icon"}
      data-app-icon
      data-image-failed={failed ? "true" : undefined}
      data-image-loaded={loaded ? "true" : undefined}
    >
      {app.icon ? (
        // eslint-disable-next-line @next/next/no-img-element -- static 128px PNGs from public/
        <img alt="" height={128} loading={detail ? undefined : "lazy"} onError={() => setFailed(true)} onLoad={() => setLoaded(true)} ref={imageRef} src={app.icon} width={128} />
      ) : null}
      <span className="app-icon-letter">{letter(app.name)}</span>
    </span>
  );
}
