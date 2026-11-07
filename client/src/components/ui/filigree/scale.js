/*
 * The scale the bramble and Art Deco ornaments are drawn at, so a thorn or a
 * stem is the same size wherever they appear (owner, Oct 2026).
 *
 * CORNER_SIZE is the side of a corner ornament's box in px, at every
 * viewport and on every frame, for the styles that do not set their own
 * CORNER_SIZE. Corner artwork is drawn in a 100-unit box, so
 * it renders at UNIT px per artwork unit; a divider drawn in the same units
 * renders at UNIT too (see bramble.jsx), including the site style's, which is
 * the bramble divider. 112px is where the sample #8 corners read well (the
 * sample's framed cover uses 104px). Rose in Bloom corners are larger, 134px
 * (see roseInBloom.js).
 */
export const CORNER_SIZE = 112;
export const UNIT = CORNER_SIZE / 100;
