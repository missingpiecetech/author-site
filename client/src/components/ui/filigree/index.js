/*
 * Filigree styles. Every style module in this folder exports the same names
 * (see bramble.jsx); design/filigree-samples/ at the repo root holds the
 * candidate styles to port from.
 *
 * The site style is Thorned Bramble. To switch the whole site, change BOTH
 * marked lines: the `export *` (the names pages import, e.g. FRAME_BORDER)
 * and SITE_FILIGREE (the frame components' default).
 */
import * as bramble from "./bramble";
import * as artDeco from "./artDeco";

export * from "./bramble"; // site style (1 of 2)
export const SITE_FILIGREE = "bramble"; // site style (2 of 2)

/*
 * Styles a single item can use instead of the site's, by name: pass
 * `filigree="artDeco"` to FramedImage, FiligreeCorners or FiligreeDivider,
 * and frame a hand-built box with that style's FRAME_BORDER from
 * getFiligree("artDeco"). To offer another style, port it into this folder
 * and add it here.
 */
export const FILIGREE_STYLES = { bramble, artDeco };

/** The style module called `name`, or the site style. */
export const getFiligree = (name = SITE_FILIGREE) =>
  FILIGREE_STYLES[name] ?? FILIGREE_STYLES[SITE_FILIGREE];
