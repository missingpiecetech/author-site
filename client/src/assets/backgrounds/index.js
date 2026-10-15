// Section background art from Michael, made by scripts/optimize-backgrounds.mjs.
// `position` is the Tailwind object-position classes that keep the art's
// subject in view when a section crops it (per breakpoint where it differs).
import cracks1280 from "./cracks-1280.webp";
import cracks2560 from "./cracks-2560.webp";
import crystal1280 from "./crystal-1280.webp";
import crystal2560 from "./crystal-2560.webp";

const art = (small, large, position) => ({
  src: large,
  srcSet: `${small} 1280w, ${large} 2560w`,
  position,
});

export const BACKGROUNDS = {
  // Dark ground split by glowing gold fissures; almost no detail to fight text.
  cracks: art(cracks1280, cracks2560, "object-center"),
  // The gold crystal at left, a night sky and the city at right. On wide
  // screens it sits at the left edge of the newsletter's centred box, with
  // the city at right.
  crystal: art(
    crystal1280,
    crystal2560,
    "object-[28%_60%] lg:object-[100%_60%]",
  ),
};
