/*
 * Filigree style #10, "Art Deco Sunburst": stepped bars running along each
 * edge, each ending in a lozenge, with a fan of rays rising from a quarter
 * disc at the corner. Ported verbatim from symbols `c10` / `d10` in
 * design/filigree-samples/index.html (all solid `currentColor` fills; the
 * divider's rule is a 3-unit stroke), so the shapes, proportions and weights
 * match the sample exactly.
 *
 * Used only for Project: Arcanist (BOOK_DATA's `filigree: "artDeco"`); the
 * rest of the site uses the site style (see ./index.js). Exports the same
 * names as every style module (see bramble.jsx).
 */

export const CORNER_VIEWBOX = "0 0 100 100";
export const DIVIDER_VIEWBOX = "0 0 240 48";

/*
 * Frame metrics (the sample card's `--bw:3px` and `--k`):
 *   - FRAME_BORDER:       the frame line, 3px, as a Tailwind class, and
 *     FRAME_BORDER_WIDTH, its width in px;
 *   - FRAME_INSET:        fraction of the corner box outside the frame line
 *                         (the frame's corner is at (20,20) in the 100 box);
 *   - FRAME_MIN_SPAN:     a framed box should be at least this many corner
 *                         sizes tall and wide, or the bars along one edge run
 *                         into each other (each reaches 91.6 of the box).
 */
export const FRAME_BORDER = "border-3";
export const FRAME_BORDER_WIDTH = 3;
export const FRAME_INSET = 0.2;
export const FRAME_MIN_SPAN = 1.6;

/*
 * Divider: the centrepiece is 240×48 (300×60 from lg, the sample's
 * `--ds: 1.25`).
 */
export const DIVIDER_ART = "h-12 w-60 lg:h-15 lg:w-75";

/*
 * The rule either side of the divider (the sample's `rule-solid`): as thick
 * as the frame line, scaled with the centrepiece, fading in from transparent
 * to full gold at 60% of its length towards the centre.
 */
export const Rule = ({ side }) => (
  <span
    className="h-[3px] min-w-3 flex-1 lg:h-[3.75px]"
    style={{
      background: `linear-gradient(${side === "left" ? "to right" : "to left"}, transparent, currentColor 60%)`,
    }}
  />
);

/* One arm (`a10`): three stepped bars with lozenge tips, and an inner bar. */
const ARM = (
  <>
    <path
      d="M22 13.6H84L79 18.6H22ZM22 7.4H62L57.8 11.6H22ZM22 1.6H42L38.2 5.4H22Z"
      fill="currentColor"
    />
    <path
      d="M89 13.5L91.6 16.1L89 18.7L86.4 16.1ZM67 7.3L69.2 9.5L67 11.7L64.8 9.5ZM47 1.6L48.9 3.5L47 5.4L45.1 3.5Z"
      fill="currentColor"
    />
    <path d="M25 24.4H60L58 26.4H25Z" fill="currentColor" />
  </>
);

export const CornerArt = () => (
  <>
    {ARM}
    <g transform="matrix(0 1 1 0 0 0)">{ARM}</g>
    <path d="M20 20H13.5A6.5 6.5 0 0 1 20 13.5Z" fill="currentColor" />
    <path d="M12.15 18.44L5.23 14.82L4.37 19.13Z" fill="currentColor" />
    <path d="M12.61 16.94L3.29 10.7L1.6 14.76Z" fill="currentColor" />
    <path d="M13.35 15.56L8.33 9.56L5.89 13.22Z" fill="currentColor" />
    <path d="M14.34 14.34L7.06 3.95L3.95 7.06Z" fill="currentColor" />
    <path d="M15.56 13.35L13.22 5.89L9.56 8.33Z" fill="currentColor" />
    <path d="M16.94 12.61L14.76 1.6L10.7 3.29Z" fill="currentColor" />
    <path d="M18.44 12.15L19.13 4.37L14.82 5.23Z" fill="currentColor" />
  </>
);

/* Half the divider (`h10`): the rule's inner end with an arm laid along it. */
const DIVIDER_HALF = (
  <>
    <path d="M104 24H240" fill="none" stroke="currentColor" strokeWidth="3" />
    <g transform="translate(118 4)">{ARM}</g>
  </>
);

export const DividerArt = () => (
  <>
    {DIVIDER_HALF}
    <g transform="matrix(-1 0 0 1 240 0)">{DIVIDER_HALF}</g>
    <path d="M113 24A7 7 0 0 1 127 24Z" fill="currentColor" />
    <path d="M111.25 21.16L105.43 17.06L104.13 21.05Z" fill="currentColor" />
    <path d="M112.56 18.59L104.24 9.96L101.78 13.36Z" fill="currentColor" />
    <path d="M114.59 16.56L112.29 9.82L108.9 12.29Z" fill="currentColor" />
    <path d="M117.16 15.25L115.51 3.38L111.51 4.68Z" fill="currentColor" />
    <path d="M120 14.8L122.1 1.5L117.9 1.5Z" fill="currentColor" />
    <path d="M122.84 15.25L128.49 4.68L124.49 3.38Z" fill="currentColor" />
    <path d="M125.41 16.56L131.1 12.29L127.71 9.82Z" fill="currentColor" />
    <path d="M127.44 18.59L138.22 13.36L135.76 9.96Z" fill="currentColor" />
    <path d="M128.75 21.16L135.87 21.05L134.57 17.06Z" fill="currentColor" />
  </>
);
