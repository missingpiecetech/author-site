/*
 * Excerpt reading depth (issue #17): how far readers really get through a
 * chapter, measured from where the text sits on screen and for how long,
 * rather than how far the page scrolled. Pure: time comes in through `now()`
 * and layout through paragraph rectangles, so the unit tests drive it with a
 * fake clock and hooks/useExcerptReading.js wires it to the page.
 *
 * - A chapter is split into blocks of whole paragraphs, about 500 words each.
 * - Reading time builds while a paragraph is in the reading zone (at least
 *   half of it inside the middle 60% of the viewport), the tab is visible and
 *   the reader is active. Each moment of time is shared among the paragraphs
 *   in the zone in proportion to their words, so a screen holding four
 *   paragraphs earns one second per second, not four.
 * - Active: a scroll, key, touch or pointer movement within the idle window,
 *   the time to read the words on screen at 250 wpm plus 50%, between 60
 *   seconds and 3 minutes.
 * - Reached: the block's first paragraph touches the reading zone.
 * - Read: the block's paragraphs hold at least 60% of the block's reading time.
 * - Skim: the page moves forward 1.5 screens or more within half a second
 *   (three screens a second, or a jump: End key, scrollbar drag, fling) and
 *   the block under the middle of the screen changes.
 */
import { isSceneBreak, wordCount } from "../excerpts/index.js";
import { EVENTS } from "./analytics.js";

export const WORDS_PER_MINUTE = 250;
export const BLOCK_WORDS = 500;
export const READ_SHARE = 0.6;
export const ZONE_TOP = 0.2;
export const ZONE_BOTTOM = 0.8;
export const SHARE_IN_ZONE = 0.5;
export const IDLE_SLACK = 1.5;
export const IDLE_FLOOR_MS = 60_000;
export const IDLE_CAP_MS = 180_000;
export const SKIM_SCREENS_PER_SECOND = 3;
export const SKIM_WINDOW_MS = 500;

/** Milliseconds to read `words` at WORDS_PER_MINUTE. */
export const readingMs = (words) => (words / WORDS_PER_MINUTE) * 60_000;

/** A block counts as read once it holds this much reading time. */
export const readThresholdMs = (blockWords) =>
  readingMs(blockWords) * READ_SHARE;

/** How long a reader may sit without input before time stops building. */
export const idleWindowMs = (visibleWords) =>
  Math.min(
    IDLE_CAP_MS,
    Math.max(IDLE_FLOOR_MS, readingMs(visibleWords) * IDLE_SLACK),
  );

/** Words per paragraph; a scene break has none. */
export const paragraphWords = (paragraphs) =>
  paragraphs.map((paragraph) =>
    isSceneBreak(paragraph) ? 0 : wordCount(paragraph),
  );

/**
 * Splits a chapter into blocks of whole paragraphs, each as close to
 * BLOCK_WORDS as paragraph boundaries allow. A paragraph joins the current
 * block unless stopping before it lands nearer the target; a last block under
 * half the target joins the one before it. Scene breaks (0 words) stay in the
 * block they fall in.
 * @param {number[]} words per paragraph
 * @returns {{ first: number, last: number, words: number }[]} paragraph index
 *   ranges, inclusive; `first` is always a paragraph with words
 */
export const splitIntoBlocks = (words) => {
  const blocks = [];
  let current = null;
  words.forEach((count, index) => {
    if (count === 0) {
      if (current) current.last = index;
      return;
    }
    if (
      current &&
      Math.abs(current.words + count - BLOCK_WORDS) >
        Math.abs(current.words - BLOCK_WORDS)
    ) {
      blocks.push(current);
      current = null;
    }
    current ??= { first: index, last: index, words: 0 };
    current.last = index;
    current.words += count;
  });
  if (current) blocks.push(current);
  if (blocks.length > 1 && blocks.at(-1).words < BLOCK_WORDS / 2) {
    const tail = blocks.pop();
    const previous = blocks.at(-1);
    previous.last = tail.last;
    previous.words += tail.words;
  }
  return blocks;
};

/** Paragraph index -> block index. */
export const blockIndexes = (blocks) => {
  const indexes = [];
  blocks.forEach((block, blockIndex) => {
    for (let i = block.first; i <= block.last; i += 1) indexes[i] = blockIndex;
  });
  return indexes;
};

/**
 * Where the text sits on screen.
 * @param {({ top: number, bottom: number } | null)[]} rects per paragraph, in
 *   viewport coordinates; null for scene breaks
 * @param {number[]} words per paragraph
 * @param {number} viewportHeight
 * @returns {{ inZone: number[], touching: number[], visibleWords: number,
 *   center: number }} paragraphs in the reading zone, paragraphs overlapping
 *   it at all, the words on screen, and the last paragraph starting above the
 *   middle of the screen (-1 before the first)
 */
export const measureLayout = (rects, words, viewportHeight) => {
  const zoneTop = viewportHeight * ZONE_TOP;
  const zoneBottom = viewportHeight * ZONE_BOTTOM;
  const zoneHeight = zoneBottom - zoneTop;
  const inZone = [];
  const touching = [];
  let visibleWords = 0;
  let center = -1;
  rects.forEach((rect, index) => {
    const height = rect ? rect.bottom - rect.top : 0;
    if (!words[index] || height <= 0) return;
    const inside =
      Math.min(rect.bottom, zoneBottom) - Math.max(rect.top, zoneTop);
    if (inside > 0) touching.push(index);
    // A paragraph taller than twice the zone counts while it fills the zone.
    if (inside >= height * SHARE_IN_ZONE || inside >= zoneHeight) {
      inZone.push(index);
    }
    const onScreen =
      Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
    if (onScreen > 0) visibleWords += (words[index] * onScreen) / height;
    if (rect.top <= viewportHeight / 2) center = index;
  });
  return { inZone, touching, visibleWords, center };
};

/**
 * The part of [from, to] that counts as reading: none while hidden, and
 * nothing after the idle window has run out since the last input.
 */
export const creditableMs = ({ from, to, lastActivity, idleMs, hidden }) =>
  hidden ? 0 : Math.max(0, Math.min(to, lastActivity + idleMs) - from);

/** Adds `ms` to the paragraphs in the zone, in proportion to their words. */
export const shareTime = (dwell, inZone, words, ms) => {
  const total = inZone.reduce((sum, index) => sum + words[index], 0);
  if (!total || ms <= 0) return dwell;
  const next = dwell.slice();
  for (const index of inZone) next[index] += (ms * words[index]) / total;
  return next;
};

/**
 * Reading state for one chapter. Call `resume` when the chapter is shown,
 * `sample` on every scroll and on a timer, `activity` on input, `visibility`
 * when the tab is hidden or shown, and `pause` when the chapter is left.
 * Events go to `emit(name, data)`; each block is reached and read at most
 * once, and the chapter viewed and completed at most once, per tracker.
 *
 * @param {{ chapter: number, words: number[], now: () => number,
 *   emit: (name: string, data: object) => void }} options
 */
export const createReadingTracker = ({ chapter, words, now, emit }) => {
  const blocks = splitIntoBlocks(words);
  const blockOf = blockIndexes(blocks);
  let dwell = words.map(() => 0);
  const reachedAt = new Map();
  const read = new Set();
  let activeMs = 0;
  let isViewed = false;
  let isPaused = true;
  let isHidden = false;
  let layout = null;
  let lastAccrual = 0;
  let lastActivity = 0;
  let positions = [];
  let skimFrom = null;

  const blockAtCenter = () =>
    layout && layout.center >= 0 ? blockOf[layout.center] : 0;

  const reach = (blockIndex) => {
    if (reachedAt.has(blockIndex)) return;
    reachedAt.set(blockIndex, activeMs);
    emit(EVENTS.EXCERPT_BLOCK_REACHED, {
      chapter,
      block: blockIndex + 1,
      words: blocks[blockIndex].words,
    });
  };

  const checkRead = () => {
    blocks.forEach((block, blockIndex) => {
      if (read.has(blockIndex)) return;
      let held = 0;
      for (let i = block.first; i <= block.last; i += 1) held += dwell[i];
      if (held < readThresholdMs(block.words)) return;
      reach(blockIndex);
      read.add(blockIndex);
      emit(EVENTS.EXCERPT_BLOCK_READ, {
        chapter,
        block: blockIndex + 1,
        seconds: Math.round((activeMs - reachedAt.get(blockIndex)) / 1000),
      });
      if (blockIndex === blocks.length - 1) {
        emit(EVENTS.EXCERPT_CHAPTER_COMPLETE, { chapter });
      }
    });
  };

  const accrue = (t) => {
    if (!isPaused && layout) {
      const ms = creditableMs({
        from: lastAccrual,
        to: t,
        lastActivity,
        idleMs: idleWindowMs(layout.visibleWords),
        hidden: isHidden,
      });
      if (ms > 0) {
        activeMs += ms;
        dwell = shareTime(dwell, layout.inZone, words, ms);
        checkRead();
      }
    }
    lastAccrual = t;
  };

  const finishSkim = () => {
    if (skimFrom === null) return;
    const to = blockAtCenter();
    if (to > skimFrom) {
      emit(EVENTS.EXCERPT_SKIM, {
        chapter,
        from_block: skimFrom + 1,
        to_block: to + 1,
      });
    }
    skimFrom = null;
  };

  // Fast: the page moved at least SKIM_SCREENS_PER_SECOND over the last
  // SKIM_WINDOW_MS, measured from the latest position at least that old.
  const trackSpeed = (t, scrollY, viewportHeight, previousBlock) => {
    positions.push({ t, scrollY });
    while (positions.length > 2 && positions[1].t <= t - SKIM_WINDOW_MS) {
      positions.shift();
    }
    const moved = Math.abs(scrollY - positions[0].scrollY);
    const isFast =
      moved >=
      SKIM_SCREENS_PER_SECOND * (SKIM_WINDOW_MS / 1000) * viewportHeight;
    if (isFast) skimFrom ??= previousBlock;
    else finishSkim();
  };

  return {
    blocks,

    resume({ hidden = false } = {}) {
      const t = now();
      isPaused = false;
      isHidden = hidden;
      lastAccrual = t;
      lastActivity = t;
      layout = null;
      positions = [];
      skimFrom = null;
      if (!isViewed) {
        isViewed = true;
        emit(EVENTS.EXCERPT_CHAPTER_VIEW, { chapter });
      }
    },

    pause() {
      accrue(now());
      finishSkim();
      isPaused = true;
    },

    activity() {
      const t = now();
      accrue(t);
      lastActivity = t;
    },

    visibility(hidden) {
      const t = now();
      accrue(t);
      isHidden = hidden;
      if (!hidden) lastActivity = t;
    },

    /**
     * @param {{ rects: ({ top: number, bottom: number } | null)[],
     *   viewportHeight: number, scrollY: number, isScroll: boolean }} sample
     */
    sample({ rects, viewportHeight, scrollY, isScroll }) {
      if (isPaused) return;
      const t = now();
      accrue(t);
      if (isScroll) lastActivity = t;
      const previousBlock = blockAtCenter();
      layout = measureLayout(rects, words, viewportHeight);
      for (const index of layout.touching) {
        if (blocks[blockOf[index]].first === index) reach(blockOf[index]);
      }
      trackSpeed(t, scrollY, viewportHeight, previousBlock);
    },
  };
};

/** The copy credit line, as plain text and as HTML. */
export const copyCredit = ({ title, author, domain }) => {
  const escape = (value) =>
    String(value).replace(
      /[&<>"]/g,
      (char) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char],
    );
  return {
    text: `Excerpt from ${title} by ${author}, ${domain}`,
    html: `<p>Excerpt from <cite>${escape(title)}</cite> by ${escape(author)}, <a href="https://${escape(domain)}">${escape(domain)}</a></p>`,
  };
};

/** Copied text and HTML with the credit line appended to each. */
export const withCredit = ({ text, html }, credit) => ({
  text: `${text}\n\n${credit.text}`,
  html: `${html}${credit.html}`,
});
