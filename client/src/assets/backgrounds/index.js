// Section background art from Michael, made by scripts/optimize-backgrounds.mjs.
// `position` is the Tailwind object-position classes that keep the art's
// subject in view when a section crops it (per breakpoint where it differs).
import characters1280 from "./characters-1280.webp";
import characters2560 from "./characters-2560.webp";
import city1280 from "./city-1280.webp";
import city2560 from "./city-2560.webp";
import cliffs1280 from "./cliffs-1280.webp";
import cliffs2560 from "./cliffs-2560.webp";
import cracks1280 from "./cracks-1280.webp";
import cracks2560 from "./cracks-2560.webp";
import crystal1280 from "./crystal-1280.webp";
import crystal2560 from "./crystal-2560.webp";
import harren1280 from "./harren-1280.webp";
import harren2560 from "./harren-2560.webp";
import skyline1280 from "./skyline-1280.webp";
import skyline2560 from "./skyline-2560.webp";

const art = (small, large, position) => ({
  src: large,
  srcSet: `${small} 1280w, ${large} 2560w`,
  position,
});

export const BACKGROUNDS = {
  // Crownfall's three leads in a street of the city, the figures at right.
  characters: art(
    characters1280,
    characters2560,
    "object-[85%_30%] lg:object-[100%_30%]",
  ),
  // The same street without the figures: rooftops at left, steps at right.
  city: art(city1280, city2560, "object-[40%_50%]"),
  // Forested cliffs over a misty valley, by day.
  cliffs: art(cliffs1280, cliffs2560, "object-[30%_45%]"),
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
  // Two men in a standoff by a wagon, one at each edge, mountains between.
  harren: art(harren1280, harren2560, "object-center"),
  // Spires against a night sky, lit windows and a raised sword at centre.
  skyline: art(skyline1280, skyline2560, "object-[50%_70%]"),
};
