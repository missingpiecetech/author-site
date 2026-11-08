/*
 * Filigree styles. Every style module in this folder exports the same names
 * (see bramble.jsx); design/filigree-samples/ and design/thorn-corners/ at
 * the repo root hold the candidate styles and the generator they come from.
 *
 * The site style is Clean Briar. To switch the whole site, change BOTH
 * marked lines: the `export *` (the names pages import, e.g. FRAME_BORDER)
 * and SITE_FILIGREE (the frame components' default).
 */
import * as bramble from "./bramble";
import * as artDeco from "./artDeco";
import * as cleanBriarCorners from "./cleanBriar.js";

export * from "./cleanBriar.js"; // site style (1 of 2)
export const SITE_FILIGREE = "cleanBriar"; // site style (2 of 2)

/* Clean Briar has corners only; its divider is the bramble one. */
const cleanBriar = {
  ...cleanBriarCorners,
  DIVIDER_VIEWBOX: bramble.DIVIDER_VIEWBOX,
  DividerArt: bramble.DividerArt,
};

/*
 * Styles a single item can use instead of the site's, by name: pass
 * `filigree="artDeco"` to FramedImage, FiligreeCorners or FiligreeDivider,
 * and frame a hand-built box with that style's FRAME_BORDER from
 * getFiligree("artDeco"). To offer another style, port it into this folder
 * and add it here.
 */
export const FILIGREE_STYLES = { cleanBriar, bramble, artDeco };

/** The style module called `name`, or the site style. */
export const getFiligree = (name = SITE_FILIGREE) =>
  FILIGREE_STYLES[name] ?? FILIGREE_STYLES[SITE_FILIGREE];
