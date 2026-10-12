# Filigree samples

`index.html` is a standalone design sheet of thirteen gold filigree styles for the site's
frames and dividers: the original hairline style (`0`, the reference card) and twelve bolder
candidates (`1`–`12`). Each card shows the style on a framed Crownfall cover, a section
divider and the store's shipping notice, at the site's colours and fonts. Open it directly in
a browser; it is not part of the app build and never ships with the site.

**The owner chose #8, Thorned Bramble (October 2026).** The site uses it everywhere filigree
appears.

## How the file is built

- One hidden SVG sprite holds every style as `<symbol>`s: `c0`–`c12` are the top-left
  corners (100-unit box; `c0` is 64), `d0`–`d12` the divider centrepieces (240×48; `d0` is
  160×24). Some styles reuse a shared part by `<use href>` (for example `d8` reuses the arm
  `a8` from `c8`), and a few use the shared `#gilt` gradient or a `mask` defined at the top
  of the sprite.
- Each card sets its frame-line width with `style="--bw:…"` and places the corner with the
  `.orn` CSS: the corner box is `--cs` wide and `--k` of it (0.2) sits outside the frame
  line. Dividers pick one rule style: `.rule-solid`, `.rule-double`, `.rule-book` or
  `.rule-taper`. A few styles add a per-card tweak (`.s6` outline, `.s11` double border).

## Switching the site to another style

The site's filigree lives in `client/src/components/ui/`:

- `Filigree.jsx` — `FiligreeCorners` and `FiligreeDivider`, the components every page uses.
  They contain no artwork.
- `filigree/index.js` — one line, `export * from "./bramble";`, choosing the active style.
- `filigree/bramble.jsx` — the Thorned Bramble artwork and metrics.

To switch to style _N_:

1. Find `<symbol id="cN">` and `<symbol id="dN">` in `index.html`, plus anything they
   reference (`<use href="#…">` parts, `url(#gilt)`, masks), and the card's `--bw` and rule
   class (search for `id="style-N"`).
2. Copy `filigree/bramble.jsx` to `filigree/<name>.jsx` and replace its contents, keeping
   the same exports:
   - `CornerArt` / `CORNER_VIEWBOX`: the `cN` paths as JSX (`stroke-width` →
     `strokeWidth`, and so on), with a shared part inlined as a JSX fragment where the
     symbol uses `<use>`. The viewBox is `cN`'s.
   - `DividerArt` / `DIVIDER_VIEWBOX` / `DIVIDER_ART`: the `dN` paths, its viewBox, and the
     rendered size as Tailwind classes (the samples draw dividers at 1.25× on desktop and
     1× on phones).
   - `Rule`: the rule either side of the divider, matching the card's `.rule-*` class.
   - `FRAME_BORDER` / `FRAME_BORDER_WIDTH`: the card's `--bw` as a Tailwind border class
     and in px. `FRAME_INSET` is `--k` (0.2 for 1–12, 0.25 for 0). `FRAME_MIN_SPAN` is the
     smallest framed box, in corner sizes, before arms on one edge meet.
   - If a style uses `#gilt` or a mask, define it inside the art with an id unique to the
     style; ids are document-global and every corner renders the art again.
3. Point `filigree/index.js` at the new module.
4. Check the sizes in `Filigree.jsx` (`SIZES`, the corner box per size) still suit the new
   corner: bigger or more inward-reaching corners may need smaller boxes or more padding in
   `FramedImage` and the panels.
5. From `client/`, run `node scripts/design-check.mjs --shots <dir>` (ornament/text
   overlap, horizontal scroll at 1440 and 390) and compare the shots with card _N_.
