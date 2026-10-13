/*
 * Filigree style #8, "Thorned Bramble": tapering briar stems that cross at
 * each corner around a closed bud, armed with hooked thorns. Ported verbatim
 * from symbols `c8` / `d8` in design/filigree-samples/index.html (all solid
 * `currentColor` fills, no strokes), so the shapes, proportions and weights
 * match the sample exactly.
 *
 * Every filigree style module exports the same names, and `../Filigree.jsx`
 * imports exactly one module:
 *   - CornerArt:  top-left corner, drawn in a CORNER_VIEWBOX box;
 *   - DividerArt: the divider ornament, drawn in a DIVIDER_VIEWBOX box,
 *                 sized by DIVIDER_ART (class names), or, without it, at
 *                 the corners' scale (scale.js);
 *   - Rule:       optional, the line either side of the divider ornament
 *                 (bramble has none: its ornament stands alone);
 *   - FRAME_*:    how corners sit on a frame (below).
 */

export const CORNER_VIEWBOX = "0 0 100 100";
export const DIVIDER_VIEWBOX = "0 0 240 48";

/*
 * Frame metrics (the sample's `--bw`, `--k` and notice min-height):
 *   - FRAME_BORDER:       the frame line, 2px, as a Tailwind class, and
 *     FRAME_BORDER_WIDTH, its width in px;
 *   - FRAME_INSET:        fraction of the corner box outside the frame line
 *                         (the frame's corner is at (20,20) in the 100 box);
 *   - FRAME_MIN_SPAN:     a framed box should be at least this many corner
 *                         sizes tall and wide, or the arms along one edge run
 *                         into each other.
 */
export const FRAME_BORDER = "border-2";
export const FRAME_BORDER_WIDTH = 2;
export const FRAME_INSET = 0.2;
export const FRAME_MIN_SPAN = 1.6;

/*
 * Divider: the ornament alone (two arms and the bud, no rules). There is no
 * DIVIDER_ART, so it is drawn at the corners' scale (UNIT px per unit,
 * 269×54px) at every viewport and its thorns and stems match the corners'.
 */

/* One arm: the stem running along the top edge, thorns and two leaves. */
const ARM = (
  <>
    <path
      d="M4.52 27.61L5.81 26.85L7.08 26.07L8.31 25.27L9.52 24.47L10.7 23.68L11.87 22.92L12.85 21.99L13.82 21.09L14.8 20.22L15.79 19.4L16.81 18.63L17.87 17.91L18.97 17.25L20.13 16.65L21.36 16.1L22.64 15.63L23.87 15.31L25.12 15.05L26.37 14.87L27.61 14.76L28.85 14.71L30.1 14.72L31.35 14.79L32.6 14.9L33.86 15.06L35.12 15.25L36.39 15.48L37.67 15.72L38.96 15.99L40.25 16.27L41.56 16.56L42.87 16.84L44.19 17.11L45.53 17.37L46.87 17.61L48.23 17.82L49.61 17.99L50.99 18.12L52.39 18.2L53.81 18.21L55.24 18.14L56.68 18.01L58.14 17.79L59.6 17.48L61.08 17.07L62.5 16.58L63.91 16.12L65.26 15.76L66.58 15.48L67.87 15.27L69.13 15.13L70.38 15.04L71.6 15.01L72.82 15.01L74.02 15.05L75.2 15.11L76.39 15.19L77.56 15.27L78.74 15.36L79.91 15.43L81.09 15.48L82.27 15.51L83.45 15.49L84.64 15.43L85.84 15.31L87.05 15.11L88.26 14.84L89.48 14.48L90.71 14.01L92.02 13.37L92.75 12.65L93.23 11.97L93.59 11.21L93.8 10.43L93.87 9.64L93.79 8.88L93.59 8.15L93.28 7.5L92.86 6.92L92.36 6.44L91.8 6.07L91.2 5.82L90.58 5.68L89.97 5.65L89.38 5.73L88.83 5.91L88.34 6.17L87.93 6.51L87.59 6.91L87.33 7.34L87.17 7.8L87.1 8.26L87.11 8.71L87.2 9.13L87.36 9.51L87.58 9.84L87.85 10.11L88.15 10.31L88.47 10.45L88.75 10.51L88.95 9.74L88.75 9.68L88.58 9.59L88.43 9.46L88.3 9.3L88.19 9.1L88.12 8.87L88.09 8.62L88.1 8.36L88.17 8.09L88.29 7.83L88.47 7.58L88.69 7.36L88.97 7.18L89.28 7.05L89.62 6.97L89.98 6.95L90.35 7.01L90.72 7.13L91.07 7.31L91.39 7.57L91.67 7.89L91.89 8.26L92.04 8.68L92.13 9.12L92.13 9.59L92.04 10.06L91.87 10.52L91.62 10.94L91.28 11.34L90.98 11.63L89.93 12.01L88.82 12.36L87.73 12.63L86.65 12.83L85.58 12.96L84.5 13.02L83.42 13.04L82.33 13.01L81.22 12.94L80.1 12.85L78.97 12.73L77.81 12.6L76.63 12.47L75.42 12.34L74.19 12.23L72.92 12.14L71.63 12.08L70.29 12.07L68.92 12.11L67.52 12.21L66.07 12.38L64.58 12.64L63.05 12.98L61.5 13.42L60.14 13.83L58.85 14.13L57.58 14.34L56.31 14.48L55.06 14.55L53.81 14.55L52.56 14.5L51.31 14.4L50.06 14.26L48.8 14.07L47.54 13.84L46.28 13.59L45.01 13.3L43.73 13.01L42.44 12.69L41.15 12.38L39.84 12.06L38.52 11.76L37.19 11.46L35.84 11.19L34.48 10.95L33.1 10.75L31.7 10.58L30.29 10.48L28.85 10.43L27.39 10.45L25.92 10.54L24.43 10.72L22.91 10.99L21.36 11.37L19.73 11.91L18.22 12.54L16.79 13.24L15.44 14.01L14.17 14.83L12.95 15.7L11.79 16.61L10.68 17.54L9.61 18.49L8.58 19.47L7.74 20.63L6.92 21.79L6.1 22.95L5.26 24.1L4.39 25.25L3.48 26.39Z"
      fill="currentColor"
    />
    <path
      d="M29.85 11.14Q31.21 9.33 29.46 5.09Q31.21 9.33 33.44 11.44Z"
      fill="currentColor"
    />
    <path
      d="M38.63 15.29Q39.61 17.02 37.34 19.71Q39.61 17.02 42.14 16.09Z"
      fill="currentColor"
    />
    <path
      d="M50.74 14.87Q52.02 13.01 50.11 8.84Q52.02 13.01 54.34 15.03Z"
      fill="currentColor"
    />
    <path
      d="M59.27 17.29Q60.96 18.27 60.32 21.57Q60.96 18.27 62.72 16.29Z"
      fill="currentColor"
    />
    <path
      d="M68.5 12.21Q69.75 10.57 67.91 7.22Q69.75 10.57 72.1 12.1Z"
      fill="currentColor"
    />
    <path
      d="M78.11 15.4Q79.41 16.78 77.82 19.39Q79.41 16.78 81.7 15.67Z"
      fill="currentColor"
    />
    <path
      d="M82.69 12.94Q84.01 11.58 82.45 8.94Q84.01 11.58 86.28 12.72Z"
      fill="currentColor"
    />
    <path
      d="M46 16.5C51.4 16.31 55.6 9.83 56 4C51.97 6.92 46.56 12.44 46 16.5Z"
      fill="currentColor"
    />
    <path
      d="M74 14.5C78.25 14.33 81.62 9.2 82 4.6C78.82 6.94 74.52 11.32 74 14.5Z"
      fill="currentColor"
    />
  </>
);

export const CornerArt = () => (
  <>
    {ARM}
    <g transform="matrix(0 1 1 0 0 0)">{ARM}</g>
    <path
      d="M16 16C10.5 15.6 5.4 10.8 4.6 4.6C10.8 5.4 15.6 10.5 16 16Z"
      fill="currentColor"
    />
    <path
      d="M15 15C13.2 13.1 8.25 11.84 5 11.5C7.36 14.39 12.01 16.5 15 15Z"
      fill="currentColor"
    />
    <path
      d="M15 15C16.5 12.01 14.39 7.36 11.5 5C11.84 8.25 13.1 13.2 15 15Z"
      fill="currentColor"
    />
    <path
      d="M2.6 2.6C2.58 3.85 4.08 5.04 5.4 5.4C5.04 4.08 3.85 2.58 2.6 2.6Z"
      fill="currentColor"
    />
    <path
      d="M25.7 23.3Q26.28 25.43 30.65 26.83Q26.28 25.43 23.3 25.7Z"
      fill="currentColor"
    />
  </>
);

/* Half the divider: an arm running out from the bud. */
const DIVIDER_HALF = <g transform="translate(118 5)">{ARM}</g>;

export const DividerArt = () => (
  <>
    {DIVIDER_HALF}
    <g transform="matrix(-1 0 0 1 240 0)">{DIVIDER_HALF}</g>
    <path
      d="M120 30C113.6 26.6 112 18 120 6C128 18 126.4 26.6 120 30Z"
      fill="currentColor"
    />
    <path
      d="M120 29C119.81 25.22 115.16 21.76 111 21C113.17 24 117.16 28.21 120 29Z"
      fill="currentColor"
    />
    <path
      d="M120 29C122.84 28.21 126.83 24 129 21C124.84 21.76 120.19 25.22 120 29Z"
      fill="currentColor"
    />
    <path
      d="M120 4C119 4.75 119.25 6.38 120 7.4C120.75 6.38 121 4.75 120 4Z"
      fill="currentColor"
    />
  </>
);
