/*
 * Book excerpts: the text lives in one module per book (crownfall.js; its
 * header explains the format). These helpers turn that data into what the
 * pages render. Pure JS, so the e2e suite can import it too.
 */
import CROWNFALL_EXCERPT from "./crownfall.js";

/** Excerpts by book slug, with the route that shows each. */
export const EXCERPTS = {
  crownfall: { path: "/books/crownfall/excerpt", excerpt: CROWNFALL_EXCERPT },
};

// A paragraph that is only `***` / `* * *` (three or more) or only `#`.
const SCENE_BREAK = /^(?:(?:\*\s*){3,}|#)$/;

export const isSceneBreak = (paragraph) => SCENE_BREAK.test(paragraph.trim());

/** "Chapter 1: Kyndel" (or "Chapter 1" without a POV name). */
export const chapterTitle = ({ number, pov }) =>
  pov ? `Chapter ${number}: ${pov}` : `Chapter ${number}`;

/** The anchor id for a chapter: `chapter-1`. */
export const chapterId = ({ number }) => `chapter-${number}`;

/** The id of a chapter's tab, which labels its panel: `chapter-1-tab`. */
export const chapterTabId = (chapter) => `${chapterId(chapter)}-tab`;

/*
 * Chapters that have text, each with its paragraphs trimmed, blanks dropped,
 * and scene breaks only between two runs of text (never leading, trailing or
 * doubled).
 */
export const readableChapters = (excerpt) =>
  (excerpt?.chapters ?? [])
    .map((chapter) => {
      const paragraphs = [];
      for (const raw of chapter.paragraphs ?? []) {
        const text = typeof raw === "string" ? raw.trim() : "";
        if (!text) continue;
        if (isSceneBreak(text)) {
          if (paragraphs.length && !isSceneBreak(paragraphs.at(-1))) {
            paragraphs.push(text);
          }
          continue;
        }
        paragraphs.push(text);
      }
      if (paragraphs.length && isSceneBreak(paragraphs.at(-1))) {
        paragraphs.pop();
      }
      return { ...chapter, paragraphs };
    })
    .filter((chapter) => chapter.paragraphs.length > 0);

export const hasExcerptText = (excerpt) => readableChapters(excerpt).length > 0;

/*
 * Inline italics: `*words*` becomes an italic segment. The asterisks must hug
 * the words (`*so*`, not `* so *`); anything else is left as written.
 * Returns [{ text, italic }].
 */
const ITALIC = /\*(?=\S)([^*\n]*?\S)\*/g;

export const parseInline = (text) => {
  const segments = [];
  let last = 0;
  for (const match of text.matchAll(ITALIC)) {
    if (match.index > last) {
      segments.push({ text: text.slice(last, match.index), italic: false });
    }
    segments.push({ text: match[1], italic: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    segments.push({ text: text.slice(last), italic: false });
  }
  return segments;
};

export const plainText = (text) =>
  parseInline(text)
    .map((segment) => segment.text)
    .join("");

export const wordCount = (text) =>
  plainText(text).split(/\s+/).filter(Boolean).length;

// Home's opening: whole paragraphs from the start of the first chapter until
// at least this many words (one or two paragraphs of a typical opening), never
// past a scene break.
export const OPENING_MIN_WORDS = 120;

/** The first chapter and its opening paragraphs, or null without text. */
export const excerptOpening = (excerpt) => {
  const [first] = readableChapters(excerpt);
  if (!first) return null;
  const paragraphs = [];
  let words = 0;
  for (const paragraph of first.paragraphs) {
    if (isSceneBreak(paragraph) || words >= OPENING_MIN_WORDS) break;
    paragraphs.push(paragraph);
    words += wordCount(paragraph);
  }
  return { chapter: first, paragraphs };
};
