/*
 * Hand-drawn gold filigree: corner flourishes for frames and a centred
 * divider for section breaks. Every ornament is drawn once (one half) and
 * mirrored, strokes stay 1px at any size (non-scaling), and colour comes from
 * `currentColor`, so `text-accent` (the default) or any text colour tints it.
 * All of it is decorative: aria-hidden and pointer-events-none.
 */

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  vectorEffect: "non-scaling-stroke",
};

/*
 * Corner, drawn for the top-left in a 64-unit box. The frame's own corner is
 * at (16,16): the frame line runs along y=16 and x=16. One arm (the top one)
 * is authored and reflected across the diagonal for the other.
 *
 * - an outer echo line 6 units outside the frame, ending in a volute that
 *   curls back on itself to a filled bead;
 * - a tendril leading out of the volute to a small leaf;
 * - a little hook hanging between the echo line and the frame;
 * - on the diagonal: a teardrop pointing out, a bead, and a leaf pointing in
 *   (kept inside the frame's inset so it never touches the picture).
 */
const CORNER_ARM = (
  <>
    <path
      {...STROKE}
      d="M10 10H28C33 10 37 7.5 36.5 4C36 1 32 .5 30.5 3C29.6 4.8 31.4 6.4 33 5.3"
    />
    <path {...STROKE} d="M36 7.4C41 10.4 47 11.2 53.5 10.6" />
    <path
      fill="currentColor"
      d="M53.5 10.6C55.8 8.6 59 8.7 61.5 10.4C59 11.9 55.8 12.2 53.5 10.6Z"
    />
    <path
      {...STROKE}
      d="M21 10C21 13.6 24.6 14.6 26.4 12.9C27.4 11.9 26.6 10.9 25.6 11.4"
    />
    <circle cx="33.2" cy="4.6" r="1.15" fill="currentColor" />
  </>
);

const CornerArt = () => (
  <>
    {CORNER_ARM}
    <g transform="matrix(0 1 1 0 0 0)">{CORNER_ARM}</g>
    <path
      fill="currentColor"
      d="M10 10C9.6 7 7.6 4.6 4 4C4.6 7.6 7 9.6 10 10Z"
    />
    <circle cx="13" cy="13" r="1" fill="currentColor" />
    <path
      fill="currentColor"
      d="M16 16C19.6 16.4 22.6 19 23.6 23.6C19 22.6 16.4 19.6 16 16Z"
    />
  </>
);

/*
 * Corner sizes. The frame corner sits a quarter of the way into the box, so
 * the offset is a quarter of the size: the ornament reaches that far outside
 * the frame and about an eighth inside it.
 *   md (frames, panels): 48px, 72px from lg  → 12px / 18px outside
 *   sm (tiles):          32px                 →  8px outside
 *   xs (icon boxes):     24px                 →  6px outside
 */
const SIZES = {
  md: "size-12 -m-3 lg:size-18 lg:-m-4.5",
  sm: "size-8 -m-2",
  xs: "size-6 -m-1.5",
};

const POSITIONS = [
  "top-0 left-0",
  "top-0 right-0 -scale-x-100",
  "bottom-0 left-0 -scale-y-100",
  "bottom-0 right-0 -scale-100",
];

/**
 * Four corner flourishes over the parent's border box. The parent must be
 * `relative` and should keep its thin 1px frame line: the ornament sits on
 * the corners and the plain line runs between them.
 *
 * - `size`: "md" (framed images, panels) | "sm" (tiles) | "xs" (icon boxes).
 */
export const FiligreeCorners = ({ size = "md", className = "text-accent" }) => (
  <span aria-hidden="true" className="contents" data-filigree="corners">
    {POSITIONS.map((position) => (
      <svg
        key={position}
        viewBox="0 0 64 64"
        focusable="false"
        className={`pointer-events-none absolute overflow-visible ${SIZES[size] ?? SIZES.md} ${position} ${className}`}
      >
        <CornerArt />
      </svg>
    ))}
  </span>
);

/*
 * Divider centrepiece in a 160×24 box centred on (80,12): an outlined
 * lozenge with a solid one inside; to each side a pair of opposed scrolls,
 * a stem with a sprig of two leaves and a bead, then the line runs on. The right half is
 * authored, its upper scroll and leaf reflected for the lower, and the whole
 * half reflected for the left.
 */
const DIVIDER_UPPER = (
  <>
    <path
      {...STROKE}
      d="M89 12C95 12 99.5 9.6 99.5 6.2C99.5 3.4 96.4 2.8 95.2 4.7C94.4 6 95.6 7.3 96.9 6.5"
    />
    <path
      fill="currentColor"
      d="M106 12C106.5 8.6 109 6.6 112.6 6C112 9.4 109.6 11.4 106 12Z"
    />
  </>
);

const DIVIDER_HALF = (
  <>
    {DIVIDER_UPPER}
    <g transform="matrix(1 0 0 -1 0 24)">{DIVIDER_UPPER}</g>
    <path {...STROKE} d="M89 12H117.6M124.4 12H160" />
    <circle cx="121" cy="12" r="1.5" fill="currentColor" />
  </>
);

const DividerArt = () => (
  <>
    {DIVIDER_HALF}
    <g transform="matrix(-1 0 0 1 160 0)">{DIVIDER_HALF}</g>
    <path {...STROKE} d="M80 3.5L88.5 12L80 20.5L71.5 12Z" />
    <path fill="currentColor" d="M80 7.5L84.5 12L80 16.5L75.5 12Z" />
  </>
);

/** A hairline that tapers to nothing at its outer end. */
const Taper = ({ side }) => (
  <svg
    viewBox="0 0 100 2"
    preserveAspectRatio="none"
    focusable="false"
    className={`h-0.5 min-w-0 flex-1 ${side === "right" ? "-scale-x-100" : ""}`}
  >
    <polygon points="0,1 100,0.5 100,1.5" fill="currentColor" />
  </svg>
);

/**
 * Ornamental section break: tapering hairlines either side of a centred
 * flourish. Fills the width it is given (cap it with `max-w-*`), with the
 * flourish 120px wide (160px from lg).
 *
 * - `lines`: false for the flourish alone (under a heading, inside a quote).
 */
export const FiligreeDivider = ({
  lines = true,
  className = "text-accent",
}) => (
  <div
    aria-hidden="true"
    data-filigree="divider"
    className={`pointer-events-none flex items-center ${lines ? "w-full" : "justify-center"} ${className}`}
  >
    {lines && <Taper side="left" />}
    <svg
      viewBox="0 0 160 24"
      focusable="false"
      className="h-4.5 w-30 shrink-0 overflow-visible lg:h-6 lg:w-40"
    >
      <DividerArt />
    </svg>
    {lines && <Taper side="right" />}
  </div>
);
