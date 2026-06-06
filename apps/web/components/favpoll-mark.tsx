import * as React from "react";

/**
 * FavpollMark — the favpoll mark (symbol only, no wordmark).
 *
 * Colour follows `currentColor`, so set it with a Tailwind `text-*` class, the
 * CSS `color` property, or the `color` prop. The mark is two-tone via opacity:
 * the heart takes the full colour, the inner strokes/dot take 60%.
 *
 * This is the text-less sibling of FavpollLogo (the full lockup). Leave
 * FavpollLogo untouched; use FavpollMark wherever you need just the symbol.
 */

// Native coordinate box of the mark (matches the design source).
export const MARK_VIEWBOX = "298 282 120 109";

export const FAVPOLL_MARK_PATHS: { d: string; opacity?: number }[] = [
  // heart outline (full colour)
  {
    d: "M411.349 318.248C414.61 318.248 416.769 315.606 416.769 312.347C413.958 295.602 399.381 282.843 381.828 282.843C372.755 282.843 364.571 286.169 358.303 291.775L355.859 289.769C349.935 285.371 342.545 282.843 334.594 282.843C315.029 282.843 299.169 298.694 299.169 318.248C299.169 327.954 303.08 336.747 309.409 343.142L328.987 362.714C331.292 365.019 335.031 365.019 337.337 362.714C339.643 360.41 339.643 356.674 337.337 354.369L317.758 334.798C313.553 330.526 310.978 324.699 310.978 318.248C310.978 305.212 321.551 294.645 334.594 294.645C340.786 294.645 346.333 296.886 350.427 300.557L358.303 307.622L366.179 300.569C370.332 296.854 375.728 294.645 381.828 294.645C392.827 294.645 402.091 302.168 404.709 312.347C404.709 315.606 408.088 318.248 411.349 318.248Z",
  },
  // long bar (60%)
  {
    d: "M352.569 335.943C352.569 339.091 355.202 341.643 358.449 341.643H405.489C408.737 341.643 411.369 339.091 411.369 335.943C411.369 332.795 408.737 330.243 405.489 330.243H358.449C355.202 330.243 352.569 332.795 352.569 335.943Z",
    opacity: 0.6,
  },
  // short bar (60%)
  {
    d: "M352.569 359.643C352.569 362.956 355.211 365.643 358.469 365.643H382.07C385.328 365.643 387.969 362.956 387.969 359.643C387.969 356.329 385.328 353.643 382.07 353.643H358.469C355.211 353.643 352.569 356.329 352.569 359.643Z",
    opacity: 0.6,
  },
  // dot (60%)
  {
    d: "M363.969 383.043C363.969 386.357 361.418 389.043 358.269 389.043C355.121 389.043 352.569 386.357 352.569 383.043C352.569 379.729 355.121 377.043 358.269 377.043C361.418 377.043 363.969 379.729 363.969 383.043Z",
    opacity: 0.6,
  },
];

/**
 * Bare <g> of mark paths in `currentColor`, drawn in the mark's native
 * coordinates. Drop straight into another SVG (e.g. the venn) where the mark
 * is already positioned, or wrap/transform it yourself.
 */
export function FavpollMarkGlyph(props: React.SVGProps<SVGGElement>) {
  return (
    <g {...props}>
      {FAVPOLL_MARK_PATHS.map((p, i) => (
        <path key={i} d={p.d} fill="currentColor" fillOpacity={p.opacity ?? 1} />
      ))}
    </g>
  );
}

export interface FavpollMarkProps extends React.SVGProps<SVGSVGElement> {
  /** Pixel size of the mark; omit to size via CSS/className instead. */
  size?: number | string;
  /** Accessible label. Omit for a decorative mark (it becomes aria-hidden). */
  title?: string;
}

/** Standalone favpoll mark. Colour follows `currentColor`. */
export default function FavpollMark({ size, title, ...rest }: FavpollMarkProps) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      width={size}
      height={size}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <FavpollMarkGlyph />
    </svg>
  );
}
