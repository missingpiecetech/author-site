# Thorn corners

`index.html` is the generator for the site's frame corners. It draws four briar families
(Rose in Bloom, Clean Briar, Wild Rose, Twin Briar), each with six corner pieces and two
straight pieces, and shows each family on a framed Crownfall cover, a quote panel and a
notice. Open it directly in a browser; it is not part of the app build and never ships.

The site's corners are **Rose in Bloom** (family id `rosesInBloom`, chosen November 2026).
Its six pieces are copied verbatim into `client/src/components/ui/filigree/roseInBloom.js`
as `CORNER_PIECES`.

## How the pieces are made

- Every piece is drawn for the top-left corner of a frame in a 100-unit box, with the frame
  line's corner at (20,20), the same box as the site's other filigree styles.
- `cornerShapes(fam, variant)` builds one piece from a seeded random generator
  (`mulberry32(variant.seed)`), so the same seed always gives the same shapes. The family
  sets the stem, thorn, leaf, bud and rose sizes; each variant sets its seed, the centre
  ornament and how each arm ends.
- It returns a list of path strings. A string starting with `E:` is drawn with
  `fill-rule="evenodd"` (the forward-facing roses have cut lines); every other string is a
  plain fill.
- `cornersFor()` shows how a frame places them: one of the six pieces per corner at random,
  each mirrored across the diagonal (`matrix(0 1 1 0 0 0)`) half the time, then flipped per
  corner (`scaleX(-1)` top right, `scaleY(-1)` bottom left, `scale(-1)` bottom right).
  `FiligreeCorners` in `client/src/components/ui/Filigree.jsx` does the same.

## Regenerating them

1. Change the family's entry in `FAMILIES` (sizes, or a variant's seed or endings) and
   reload the page to see the frames and the six pieces. "Shuffle the frames" draws new
   random arrangements.
2. In the browser console, print the pieces as the array the site uses:

   ```js
   const fam = FAMILIES.find((f) => f.id === 'rosesInBloom');
   copy(
   	JSON.stringify(
   		fam.variants.map((v) => cornerShapes(fam, v)),
   		null,
   		2
   	)
   );
   ```

3. Paste the result over `CORNER_PIECES` in `roseInBloom.js`. If the corner size changes,
   update the family's `corner` here and `CORNER_SIZE` there to match.
4. From `client/`, run `node scripts/design-check.mjs` and check the frames on `/`, `/books`,
   `/store` and `/about` at 1440 and 390.
