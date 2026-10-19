import { describe, expect, it } from "vitest";
import {
  copyCredit,
  createReadingTracker,
  creditableMs,
  idleWindowMs,
  measureLayout,
  readThresholdMs,
  readingMs,
  shareTime,
  splitIntoBlocks,
  withCredit,
} from "../../src/lib/excerptReading.js";

const words = (block) => block.words;

describe("splitIntoBlocks", () => {
  it("cuts whole paragraphs at about 500 words", () => {
    const blocks = splitIntoBlocks(new Array(10).fill(100));
    expect(blocks).toEqual([
      { first: 0, last: 4, words: 500 },
      { first: 5, last: 9, words: 500 },
    ]);
  });

  it("stops before a paragraph when stopping lands nearer 500", () => {
    expect(splitIntoBlocks([300, 450, 400]).map(words)).toEqual([
      300, 450, 400,
    ]);
    expect(splitIntoBlocks([450, 100, 400, 200]).map(words)).toEqual([
      550, 600,
    ]);
  });

  it("keeps an oversized paragraph whole and folds a short tail into the block before", () => {
    expect(splitIntoBlocks([800, 400])).toEqual([
      { first: 0, last: 0, words: 800 },
      { first: 1, last: 1, words: 400 },
    ]);
    expect(splitIntoBlocks([500, 100])).toEqual([
      { first: 0, last: 1, words: 600 },
    ]);
  });

  it("leaves scene breaks inside the block they fall in, never first", () => {
    expect(splitIntoBlocks([300, 0, 300, 0, 500])).toEqual([
      { first: 0, last: 3, words: 600 },
      { first: 4, last: 4, words: 500 },
    ]);
  });

  it("returns no blocks for no text", () => {
    expect(splitIntoBlocks([])).toEqual([]);
    expect(splitIntoBlocks([0, 0])).toEqual([]);
  });
});

describe("reading times", () => {
  it("reads at 250 words a minute and counts a block read at 60% of its time", () => {
    expect(readingMs(250)).toBe(60_000);
    expect(readThresholdMs(500)).toBe(72_000);
  });

  it("idle window: on-screen reading time plus 50%, between 60 s and 3 min", () => {
    expect(idleWindowMs(0)).toBe(60_000);
    expect(idleWindowMs(100)).toBe(60_000);
    expect(idleWindowMs(250)).toBe(90_000);
    expect(idleWindowMs(400)).toBe(144_000);
    expect(idleWindowMs(2000)).toBe(180_000);
  });

  it("credits nothing while hidden and nothing past the idle window", () => {
    const base = { from: 1000, to: 11_000, lastActivity: 0, idleMs: 60_000 };
    expect(creditableMs({ ...base, hidden: false })).toBe(10_000);
    expect(creditableMs({ ...base, hidden: true })).toBe(0);
    expect(creditableMs({ ...base, to: 600_000, hidden: false })).toBe(59_000);
    expect(
      creditableMs({ ...base, from: 70_000, to: 80_000, hidden: false }),
    ).toBe(0);
  });

  it("shares time among the paragraphs in the zone by their words", () => {
    expect(shareTime([0, 0, 0], [0, 1], [100, 300, 50], 4000)).toEqual([
      1000, 3000, 0,
    ]);
    expect(shareTime([5, 0], [], [100, 100], 4000)).toEqual([5, 0]);
  });
});

describe("measureLayout", () => {
  // Viewport 1000px: the reading zone is 200..800.
  it("puts a paragraph in the zone once half of it is inside", () => {
    const layout = measureLayout(
      [
        { top: 0, bottom: 150 },
        { top: 100, bottom: 300 },
        { top: 750, bottom: 900 },
        null,
        { top: 1200, bottom: 1300 },
      ],
      [100, 100, 100, 0, 100],
      1000,
    );
    expect(layout.inZone).toEqual([1]);
    expect(layout.touching).toEqual([1, 2]);
    expect(layout.visibleWords).toBeCloseTo(300);
    expect(layout.center).toBe(1);
  });

  it("counts a paragraph taller than the zone while it fills the zone", () => {
    const layout = measureLayout([{ top: -500, bottom: 1700 }], [400], 1000);
    expect(layout.inZone).toEqual([0]);
  });

  it("skips hidden paragraphs (zero height)", () => {
    const layout = measureLayout([{ top: 0, bottom: 0 }], [100], 1000);
    expect(layout).toEqual({
      inZone: [],
      touching: [],
      visibleWords: 0,
      center: -1,
    });
  });
});

// Paragraphs stacked `height` px apart in a 1000px viewport (reading zone
// 200..800). With the default ten 100-word, 400px paragraphs (two 500-word
// blocks), centring paragraph i puts it alone in the zone.
const VIEWPORT = 1000;
const WORDS = new Array(10).fill(100);

const setup = ({ words = WORDS, height = 400 } = {}) => {
  let clock = 0;
  const events = [];
  const tracker = createReadingTracker({
    chapter: 2,
    words,
    now: () => clock,
    emit: (name, data) => events.push({ name, data }),
  });
  const sampleAt = (scrollY, isScroll) =>
    tracker.sample({
      rects: words.map((_, i) => ({
        top: i * height - scrollY,
        bottom: (i + 1) * height - scrollY,
      })),
      viewportHeight: VIEWPORT,
      scrollY,
      isScroll,
    });
  return {
    tracker,
    centre: (i) => i * height + height / 2 - VIEWPORT / 2,
    scrollTo: (scrollY) => sampleAt(scrollY, true),
    tick: (scrollY) => sampleAt(scrollY, false),
    advance: (ms) => {
      clock += ms;
    },
    named: (name) => events.filter((e) => e.name === name).map((e) => e.data),
  };
};

describe("createReadingTracker", () => {
  it("steady reading at 250 wpm reads every block and completes the chapter", () => {
    const t = setup();
    t.tracker.resume();
    for (let i = 0; i < WORDS.length; i += 1) {
      t.scrollTo(t.centre(i));
      t.advance(readingMs(WORDS[i]));
    }
    t.tick(t.centre(WORDS.length - 1));
    expect(t.named("excerpt_chapter_view")).toEqual([{ chapter: 2 }]);
    expect(t.named("excerpt_block_reached")).toEqual([
      { chapter: 2, block: 1, words: 500 },
      { chapter: 2, block: 2, words: 500 },
    ]);
    // 60% of a block's 120 s is 72 s: three of its five paragraphs. Block 2
    // is reached a paragraph early, as its first paragraph enters the zone
    // under the last one of block 1.
    expect(t.named("excerpt_block_read")).toEqual([
      { chapter: 2, block: 1, seconds: 72 },
      { chapter: 2, block: 2, seconds: 96 },
    ]);
    expect(t.named("excerpt_chapter_complete")).toEqual([{ chapter: 2 }]);
    expect(t.named("excerpt_skim")).toEqual([]);
  });

  it("reading at twice the speed reaches every block but reads none", () => {
    const t = setup();
    t.tracker.resume();
    for (let i = 0; i < WORDS.length; i += 1) {
      t.scrollTo(t.centre(i));
      t.advance(readingMs(WORDS[i]) / 2);
    }
    t.tick(t.centre(WORDS.length - 1));
    expect(t.named("excerpt_block_reached")).toHaveLength(2);
    expect(t.named("excerpt_block_read")).toEqual([]);
  });

  it("time on a screen is shared, not counted once per paragraph", () => {
    // 100px paragraphs: six sit in the zone at once. 30 s there is 30 s of
    // reading, short of block 1's 72 s.
    const t = setup({ height: 100 });
    t.tracker.resume();
    t.scrollTo(0);
    for (let s = 0; s < 30; s += 5) {
      t.advance(5000);
      t.tracker.activity();
    }
    t.tick(0);
    expect(t.named("excerpt_block_read")).toEqual([]);
  });

  it("a fast pass reaches blocks without reading them, and flags a skim", () => {
    const t = setup();
    t.tracker.resume();
    t.scrollTo(0);
    for (let y = 0; y <= t.centre(9); y += 200) {
      t.advance(16);
      t.scrollTo(y);
    }
    t.advance(1000);
    t.tick(t.centre(9));
    expect(t.named("excerpt_block_reached").map((e) => e.block)).toEqual([
      1, 2,
    ]);
    expect(t.named("excerpt_block_read")).toEqual([]);
    expect(t.named("excerpt_skim")).toEqual([
      { chapter: 2, from_block: 1, to_block: 2 },
    ]);
  });

  it("a jump (End key) is a skim and reaches only where it lands", () => {
    const t = setup({ words: new Array(15).fill(100) });
    t.tracker.resume();
    t.scrollTo(t.centre(0));
    t.advance(2000);
    t.scrollTo(t.centre(14));
    t.advance(1000);
    t.tick(t.centre(14));
    expect(t.named("excerpt_skim")).toEqual([
      { chapter: 2, from_block: 1, to_block: 3 },
    ]);
    expect(t.named("excerpt_block_reached").map((e) => e.block)).toEqual([1]);
  });

  it("slow page-sized steps are not a skim; jumping back up is not either", () => {
    const t = setup();
    t.tracker.resume();
    t.scrollTo(0);
    for (let y = 900; y <= t.centre(9); y += 900) {
      t.advance(1000);
      t.scrollTo(y);
    }
    t.advance(1000);
    t.scrollTo(0);
    t.advance(1000);
    t.tick(0);
    expect(t.named("excerpt_skim")).toEqual([]);
  });

  it("time in a hidden tab adds nothing, even with input", () => {
    const hidden = setup();
    hidden.tracker.resume();
    hidden.scrollTo(0);
    hidden.tracker.visibility(true);
    for (let s = 0; s < 600; s += 10) {
      hidden.advance(10_000);
      hidden.tracker.activity();
    }
    hidden.tracker.visibility(false);
    hidden.tick(0);
    expect(hidden.named("excerpt_block_read")).toEqual([]);

    const visible = setup();
    visible.tracker.resume();
    visible.scrollTo(0);
    for (let s = 0; s < 600; s += 10) {
      visible.advance(10_000);
      visible.tracker.activity();
    }
    visible.tick(0);
    expect(visible.named("excerpt_block_read")).toHaveLength(1);
  });

  it("an idle reader stops building time once the idle window runs out", () => {
    // 1000px paragraphs: one 100-word paragraph fills the screen, so the
    // window is its 60 s floor, short of block 1's 72 s.
    const idle = setup({ height: 1000 });
    idle.tracker.resume();
    idle.scrollTo(idle.centre(0));
    idle.advance(10 * 60_000);
    idle.tick(idle.centre(0));
    expect(idle.named("excerpt_block_read")).toEqual([]);

    const active = setup({ height: 1000 });
    active.tracker.resume();
    active.scrollTo(active.centre(0));
    for (let s = 0; s < 90; s += 30) {
      active.advance(30_000);
      active.tracker.activity();
    }
    expect(active.named("excerpt_block_read")).toEqual([
      { chapter: 2, block: 1, seconds: 90 },
    ]);
  });

  it("the idle window never exceeds 3 minutes", () => {
    // One 2000-word paragraph fills the zone and the screen: 288 s to read
    // 60% of it, but a still reader is credited 180 s at most.
    const t = setup({ words: [2000], height: 3000 });
    t.tracker.resume();
    t.scrollTo(1000);
    t.advance(60 * 60_000);
    t.tick(1000);
    expect(t.named("excerpt_block_read")).toEqual([]);
    for (let s = 0; s < 180; s += 30) {
      t.advance(30_000);
      t.tracker.activity();
    }
    expect(t.named("excerpt_block_read")).toHaveLength(1);
  });

  it("views a chapter and reports each block once across pause and resume", () => {
    const t = setup();
    t.tracker.resume();
    t.scrollTo(t.centre(0));
    t.tracker.pause();
    t.advance(60_000);
    t.tracker.resume();
    t.scrollTo(t.centre(0));
    expect(t.named("excerpt_chapter_view")).toHaveLength(1);
    expect(t.named("excerpt_block_reached")).toHaveLength(1);
  });

  it("time while paused (another chapter shown) adds nothing", () => {
    const t = setup();
    t.tracker.resume();
    t.scrollTo(t.centre(2));
    t.tracker.pause();
    t.advance(10 * 60_000);
    t.tracker.resume();
    t.scrollTo(t.centre(2));
    expect(t.named("excerpt_block_read")).toEqual([]);
  });
});

describe("copy credit", () => {
  const credit = copyCredit({
    title: "Crownfall",
    author: "Michael Vadney",
    domain: "michaelvadney.com",
  });

  it("appends the credit line to the plain and the HTML text", () => {
    expect(
      withCredit({ text: "Kyndel ran.", html: "<p>Kyndel ran.</p>" }, credit),
    ).toEqual({
      text: "Kyndel ran.\n\nExcerpt from Crownfall by Michael Vadney, michaelvadney.com",
      html: '<p>Kyndel ran.</p><p>Excerpt from <cite>Crownfall</cite> by Michael Vadney, <a href="https://michaelvadney.com">michaelvadney.com</a></p>',
    });
  });

  it("escapes markup in the credit's values", () => {
    const html = copyCredit({
      title: "A <b> & B",
      author: 'M "V"',
      domain: "example.com",
    }).html;
    expect(html).toContain("<cite>A &lt;b&gt; &amp; B</cite>");
    expect(html).toContain("M &quot;V&quot;");
  });
});
