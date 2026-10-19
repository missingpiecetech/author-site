import { useId } from "react";
import Section from "./ui/Section";
import Eyebrow from "./ui/Eyebrow";
import WRITING_DESK from "../WRITING_DESK";

/** A finite percent clamped to 0–100, or null when there is none to show. */
const clampPercent = (percent) => {
  if (percent === null || percent === undefined || percent === "") return null;
  const value = Number(percent);
  if (!Number.isFinite(value)) return null;
  return Math.round(Math.min(100, Math.max(0, value)));
};

/**
 * One work in progress: title, then "type · status · percent%" and a gold bar
 * on a `rule` track. Missing parts are skipped; with no percent there is no
 * number and no bar.
 */
export const WorkProgress = ({ title, type, status, percent }) => {
  const titleId = useId();
  const value = clampPercent(percent);
  const detail = [type, status, value !== null && `${value}%`]
    .filter(Boolean)
    .join(" · ");

  return (
    <li className="flex flex-col gap-2.5 lg:gap-3.5">
      <div className="flex flex-col gap-1 lg:flex-row lg:flex-wrap lg:items-baseline lg:justify-between lg:gap-x-6">
        <span
          id={titleId}
          className="text-base font-medium text-cream lg:font-display lg:text-[1.6875rem] lg:leading-tight lg:font-semibold"
        >
          {title}
        </span>
        {detail && (
          <span className="text-base text-muted lg:text-base">{detail}</span>
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
 * "From the Writing Desk": the works in progress listed in WRITING_DESK.js,
 * most complete first (works with no percent last). Renders nothing when the
 * list is empty. Section props (`band`, …) pass through.
 */
const WritingDesk = ({ works = WRITING_DESK, ...rest }) => {
  if (!works.length) return null;
  const ordered = [...works].sort(
    (a, b) => (b.percent ?? -1) - (a.percent ?? -1),
  );

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
          Stories in the Works
        </h2>
      </div>
      <ul
        className="flex flex-1 flex-col justify-center gap-7 lg:gap-11"
        data-aos="fade-up"
      >
        {ordered.map((work) => (
          <WorkProgress key={work.title} {...work} />
        ))}
      </ul>
    </Section>
  );
};

export default WritingDesk;
