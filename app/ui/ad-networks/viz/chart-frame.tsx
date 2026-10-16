"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode, type RefObject } from "react";
import { clamp } from "./format";
import styles from "./viz.module.css";

// Runs before paint in the browser; the server never calls it.
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * The chart box's real pixel width. The server and the first browser render use `initial`, with
 * the SVG scaled to fit, so the chart is in the HTML before scripts run. After that the chart
 * redraws at the real width on every resize, so its text stays 12px.
 */
export function useChartWidth(initial: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(initial);
  const [measured, setMeasured] = useState(false);
  useBrowserLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const read = () => {
      const next = Math.floor(element.clientWidth);
      if (!next) return;
      setWidth(next);
      setMeasured(true);
    };
    read();
    const observer = new ResizeObserver(read);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width, measured };
}

/** SVG size attributes: exact once measured, scaled to the box before that. */
export function svgSize(width: number, height: number, measured: boolean) {
  return measured
    ? { width, height, viewBox: `0 0 ${width} ${height}` }
    : { width: "100%", viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: "xMinYMin meet" as const };
}

export type ChartPoint = {
  /** Position in chart pixels. */
  x: number;
  y: number;
  /** Draw a dot at the point, as on a line. */
  dot?: boolean;
  tip: ReactNode;
};

/**
 * A chart box that shows the exact numbers for one value on hover, tap, or arrow keys, with an
 * optional guide line and dot (mockup sites over time and joined and left). Escape or a tap
 * elsewhere hides the label.
 */
export function InteractiveChart({ children, count, guide, indexAt, label, measureRef, onActive, pointAt, width }: {
  children: ReactNode;
  /** How many values the keys step through. */
  count: number;
  /** Top and bottom of the guide line in chart pixels. Leave out for bar charts. */
  guide?: readonly [number, number];
  /** The value index under a pointer, from its x position in chart pixels. */
  indexAt: (x: number) => number;
  /** The chart's name, read before the key hint. */
  label: string;
  measureRef: RefObject<HTMLDivElement | null>;
  /** Called with the active index, or -1 when nothing is active. */
  onActive?: (index: number) => void;
  pointAt: (index: number) => ChartPoint;
  /** The width the chart is drawn at, to map pointer and label positions. */
  width: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  // Pointer down runs before focus, so focus reads the index it set from here.
  const activeRef = useRef<number | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const scale = () => (measureRef.current?.clientWidth || width) / width;

  const show = useCallback((index: number) => {
    const next = clamp(Math.round(index), 0, Math.max(0, count - 1));
    activeRef.current = next;
    setActive(next);
    setVisible(true);
    onActive?.(next);
  }, [count, onActive]);
  const hide = useCallback(() => {
    setVisible(false);
    onActive?.(-1);
  }, [onActive]);

  useEffect(() => {
    const away = (event: globalThis.PointerEvent) => {
      if (measureRef.current && !measureRef.current.contains(event.target as Node)) hide();
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [hide, measureRef]);

  const point = visible && active !== null && active < count ? pointAt(active) : null;

  // Keep the label inside the box.
  useBrowserLayoutEffect(() => {
    const tip = tipRef.current;
    const box = measureRef.current;
    if (!tip || !box || !point) return;
    const half = tip.offsetWidth / 2;
    tip.style.left = `${clamp(point.x * scale(), half, Math.max(half, box.clientWidth - half))}px`;
    tip.style.top = `${point.y * scale() - 12}px`;
  });

  const at = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    return indexAt((event.clientX - box.left) / scale());
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = activeRef.current ?? count - 1;
    const next = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: count - 1 }[event.key];
    if (next !== undefined) {
      event.preventDefault();
      show(next);
    } else if (event.key === "Escape") hide();
  };

  return (
    <div
      aria-label={`${label}. Use the arrow keys to read each value.`}
      className={`${styles.viz} ${styles.ix} ${styles.tokens}`}
      onBlur={hide}
      onFocus={() => show(activeRef.current ?? count - 1)}
      onKeyDown={onKeyDown}
      onPointerDown={(event) => show(at(event))}
      onPointerLeave={(event) => { if (event.pointerType === "mouse" && document.activeElement !== event.currentTarget) hide(); }}
      onPointerMove={(event) => { if (event.pointerType === "mouse") show(at(event)); }}
      ref={measureRef}
      role="group"
      tabIndex={0}
    >
      {children}
      {point && guide ? <div className={styles.guide} style={{ height: (guide[1] - guide[0]) * scale(), left: point.x * scale(), top: guide[0] * scale() }} /> : null}
      {point?.dot ? <div className={styles.dot} style={{ left: point.x * scale(), top: point.y * scale() }} /> : null}
      <div className={styles.tip} hidden={!point} ref={tipRef} role="status">{point?.tip}</div>
    </div>
  );
}

/** A chart box that only measures its width, for charts with no hover. */
export function MeasuredChart({ children, measureRef }: { children: ReactNode; measureRef: RefObject<HTMLDivElement | null> }) {
  return <div className={`${styles.viz} ${styles.tokens}`} ref={measureRef}>{children}</div>;
}
