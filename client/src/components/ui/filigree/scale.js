/*
 * The one scale every filigree ornament is drawn at, so a thorn or a stem is
 * the same size wherever it appears (owner, Oct 2026).
 *
 * CORNER_SIZE is the side of a corner ornament's box in px, at every
 * viewport and on every frame. Corner artwork is drawn in a 100-unit box, so
 * it renders at UNIT px per artwork unit; a divider drawn in the same units
 * renders at UNIT too (see bramble.jsx). 112px is where the sample #8 corners
 * read well (the sample's framed cover uses 104px).
 */
export const CORNER_SIZE = 112;
export const UNIT = CORNER_SIZE / 100;
