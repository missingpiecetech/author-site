import { useId } from "react";
import Section from "./ui/Section";
import Eyebrow from "./ui/Eyebrow";
import WRITING_DESK, { updated } from "../WRITING_DESK";

/** A finite percent clamped to 0–100, or null when there is none to show. */
const clampPercent = (percent) => {
  if (percent === null || percent === undefined || percent === "") return null;
  const value = Number(percent);
  if (!Number.isFinite(value)) return null;
  return Math.round(Math.min(100, Math.max(0, value)));
};

/**
 * One work in progress: title, then "status · percent%" and a gold bar on a
 * `rule` track. With no percent, only the status shows (no number, no bar).
 */
export const WorkProgress = ({ title, status, percent }) => {
  const titleId = useId();
  const value = clampPercent(percent);
  const detail = [status, value !== null && `${value}%`]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="flex flex-col gap-2.5 lg:gap-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <span
          id={titleId}
          className="text-base font-medium text-cream lg:font-display lg:text-[1.875rem] lg:leading-tight lg:font-semibold"
        >
          {title}
        </span>
        {detail && (
          <span className="text-base text-muted lg:text-[1.0625rem]">
            {detail}
          </span>
        )}
      </div>
      {value !== null && (
        <div
          role="progressbar"
          aria-labelledby={titleId}
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 overflow-hidden rounded-full bg-rule lg:h-2.5"
        >
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${value}%` }}
          />
        </div>
      )}
    </li>
  );
};

/**
 * "From the Writing Desk": the works in progress listed in WRITING_DESK.js.
 * Renders nothing when the list is empty. Section props (`band`, `ruled`, …)
 * pass through.
 */
const WritingDesk = ({ works = WRITING_DESK, ...rest }) => {
  if (!works.length) return null;

  return (
    <Section
      id="writing-desk"
      aria-labelledby="writing-desk-heading"
      innerClassName="flex flex-col gap-7 lg:flex-row lg:gap-24"
      {...rest}
    >
      <div className="flex shrink-0 flex-col gap-4 lg:w-110 lg:gap-6">
        <Eyebrow>From the Writing Desk</Eyebrow>
        <h2 id="writing-desk-heading" className="text-heading text-cream">
          What’s coming next
        </h2>
        <p className="hidden text-lede text-muted lg:block">
          Progress on the books in the works.
          {updated && ` Updated ${updated}.`}
        </p>
      </div>
      <ul
        className="flex flex-1 flex-col justify-center gap-7 lg:gap-11"
        data-aos="fade-up"
      >
        {works.map((work) => (
          <WorkProgress key={work.title} {...work} />
        ))}
      </ul>
    </Section>
  );
};

export default WritingDesk;
