/*
 * Crownfall: the first three chapters, for the excerpt page
 * (/books/crownfall/excerpt) and the opening shown in Home's "Read an Excerpt".
 *
 * Format
 * - `paragraphs`: one string per paragraph, in reading order. Paste the text
 *   as it is; no HTML.
 * - Scene breaks: a paragraph that is only `***` (or `* * *`) or only `#`.
 *   It renders as a small centred ornament.
 * - Italics: wrap words in single asterisks, e.g. "*Not again,* he thought."
 *   Nothing else is interpreted (no bold, no links). A lone asterisk is
 *   shown as written.
 * - Curly quotes and apostrophes (’ “ ”) and em dashes (—) are fine as-is.
 * - `number` and `pov` make the heading, "Chapter 1: Kyndel".
 *
 * While every `paragraphs` array is empty, Home hides "Read an Excerpt" and
 * the excerpt page says the excerpt is coming soon. Home's opening is taken
 * from the start of Chapter 1 automatically (whole paragraphs, about 120 to
 * 200 words), so there is nothing else to fill in.
 */
const CROWNFALL_EXCERPT = {
  chapters: [
    { number: 1, pov: "Kyndel", paragraphs: [] },
    { number: 2, pov: "Jelert", paragraphs: [] },
    { number: 3, pov: "Amara", paragraphs: [] },
  ],
};

export default CROWNFALL_EXCERPT;
