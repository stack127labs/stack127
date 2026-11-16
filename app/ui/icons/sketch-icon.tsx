import type { ReactElement, SVGProps } from "react";

export type SketchIconProps = Omit<SVGProps<SVGSVGElement>, "stroke" | "strokeWidth"> & {
  size?: number | string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
  color?: string;
};

export type SketchIcon = ((props: SketchIconProps) => ReactElement) & { displayName?: string };

// rough.js lines read heavier than clean ones, so the sketch draws 5% thinner
// than the width asked for. The default, 2, becomes the approved 1.9.
const SKETCH_WEIGHT = 0.95;

function hasA11yProp(props: object) {
  return Object.keys(props).some((key) => key.startsWith("aria-") || key === "role" || key === "title");
}

/** Builds one sketched lucide icon. Used by the generated sketch-icons module. */
export function createSketchIcon(name: string, d: string): SketchIcon {
  function Icon({ size = 24, strokeWidth = 2, absoluteStrokeWidth, color = "currentColor", className, children, ...rest }: SketchIconProps) {
    const width = absoluteStrokeWidth ? (Number(strokeWidth) * 24) / Number(size) : Number(strokeWidth);
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={Math.round(width * SKETCH_WEIGHT * 100) / 100}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className ? `sketch-icon sketch-icon-${name} ${className}` : `sketch-icon sketch-icon-${name}`}
        aria-hidden={children || hasA11yProp(rest) ? undefined : true}
        {...rest}
      >
        <path d={d} />
        {children}
      </svg>
    );
  }
  Icon.displayName = name;
  return Icon;
}
