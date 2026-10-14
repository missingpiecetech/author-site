import { useEffect, useRef } from "react";
import { createReadingTracker, paragraphWords } from "../lib/excerptReading.js";
import { track } from "../lib/analytics.js";

const SAMPLE_INTERVAL_MS = 1000;
const ACTIVITY_EVENTS = ["keydown", "pointermove", "pointerdown", "touchstart"];

/**
 * Measures reading depth on one excerpt chapter while it is the selected tab
 * (src/lib/excerptReading.js has the rules). `panelRef` is the chapter's
 * element; its paragraphs carry `data-paragraph` with their index in
 * `chapter.paragraphs`. The tracker lives as long as the chapter's panel, so
 * switching tabs and back never reports a block twice.
 */
const useExcerptReading = ({ panelRef, chapter, isSelected }) => {
  const trackerRef = useRef(null);

  useEffect(() => {
    if (!isSelected) return undefined;
    const panel = panelRef.current;
    const count = chapter.paragraphs.length;
    trackerRef.current ??= createReadingTracker({
      chapter: chapter.number,
      words: paragraphWords(chapter.paragraphs),
      now: () => performance.now(),
      emit: track,
    });
    const tracker = trackerRef.current;
    const elements = [...panel.querySelectorAll("[data-paragraph]")];

    const sample = (isScroll) => {
      const rects = new Array(count).fill(null);
      for (const element of elements) {
        const { top, bottom } = element.getBoundingClientRect();
        rects[Number(element.dataset.paragraph)] = { top, bottom };
      }
      tracker.sample({
        rects,
        viewportHeight: window.innerHeight,
        scrollY: window.scrollY,
        isScroll,
      });
    };
    const onScroll = () => sample(true);
    const onActivity = () => tracker.activity();
    const onVisibility = () =>
      tracker.visibility(document.visibilityState === "hidden");

    tracker.resume({ hidden: document.visibilityState === "hidden" });
    // Measure after the frame, once a "Next chapter" or hash scroll has moved
    // the page, so the old scroll position never counts against this chapter.
    const firstFrame = requestAnimationFrame(() => sample(false));
    const interval = setInterval(() => sample(false), SAMPLE_INTERVAL_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    for (const name of ACTIVITY_EVENTS) {
      window.addEventListener(name, onActivity, { passive: true });
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(firstFrame);
      clearInterval(interval);
      window.removeEventListener("scroll", onScroll);
      for (const name of ACTIVITY_EVENTS) {
        window.removeEventListener(name, onActivity);
      }
      document.removeEventListener("visibilitychange", onVisibility);
      tracker.pause();
    };
  }, [isSelected, chapter, panelRef]);

  return trackerRef;
};

export default useExcerptReading;
