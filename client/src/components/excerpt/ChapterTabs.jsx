import { useRef } from "react";
import { chapterId, chapterTabId, chapterTitle } from "../../excerpts/index.js";

/**
 * The excerpt's chapter tabs (WAI-ARIA tabs, automatic activation): one tab
 * per chapter, the selected one filled gold. Left/Right move to the previous
 * or next tab (wrapping), Home/End to the first or last; only the selected
 * tab is in the Tab order. Labels read "Chapter 1: Kyndel" from `sm` and
 * "Ch. 1" over "Kyndel" on phones.
 *
 * - `selected`: index of the selected chapter.
 * - `onSelect(index)`: called on click and on arrow/Home/End.
 */
const ChapterTabs = ({ chapters, selected, onSelect, className = "" }) => {
  const tabs = useRef([]);

  const handleKeyDown = (event) => {
    const last = chapters.length - 1;
    const target = {
      ArrowRight: selected === last ? 0 : selected + 1,
      ArrowLeft: selected === 0 ? last : selected - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    onSelect(target);
    tabs.current[target]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Chapters"
      data-testid="excerpt-chapter-nav"
      onKeyDown={handleKeyDown}
      className={`grid auto-cols-fr grid-flow-col gap-1 rounded-btn bg-well p-1 ${className}`}
    >
      {chapters.map((chapter, index) => {
        const isSelected = index === selected;
        return (
          <button
            key={chapter.number}
            ref={(el) => {
              tabs.current[index] = el;
            }}
            type="button"
            role="tab"
            id={chapterTabId(chapter)}
            aria-selected={isSelected}
            aria-controls={chapterId(chapter)}
            tabIndex={isSelected ? 0 : -1}
            data-testid={`excerpt-tab-${chapter.number}`}
            onClick={() => onSelect(index)}
            className={`min-h-14 cursor-pointer rounded-btn px-2 py-2 text-center font-body transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-hover sm:px-4 lg:min-h-13.5 lg:text-[1.0625rem] ${
              isSelected
                ? "bg-accent font-medium text-ground"
                : "text-muted hover:bg-surface hover:text-cream"
            }`}
          >
            <span className="flex flex-col items-center leading-tight sm:hidden">
              <span className="text-eyebrow uppercase tracking-eyebrow">
                Ch. {chapter.number}
              </span>
              {chapter.pov && (
                <>
                  <span className="sr-only"> · </span>
                  <span className="font-display text-lg font-semibold">
                    {chapter.pov}
                  </span>
                </>
              )}
            </span>
            <span className="hidden sm:inline">{chapterTitle(chapter)}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ChapterTabs;
