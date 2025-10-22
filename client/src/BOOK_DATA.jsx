import { GiCrystalGrowth, GiClockwork } from "react-icons/gi";

export const BOOK_STATUS = {
  IN_DEVELOPMENT: "Worldbuilding & Development",
  OUTLINE_STAGE: "Outline Stage",
  WRITING_STAGE: "Writing Stage",
  EDITING_STAGE: "Editing Stage",
  COMING_SOON: "Coming Soon",
  PRE_ORDER: "Available for Pre-order",
  RELEASED: "Released",
};

export const BOOKS = [
  {
    id: 1,
    title: "Crownfall",
    subtitle: "Trust is the hardest Lesson",
    blurb: (
      <>
        Nearly a decade under the empire’s grip has left Burunt a troubled land,
        its unrest simmering beneath a fragile surface.
        <br />
        <br />
        Kyndel Heim knows the truth behind the Viceroy’s rise to power. After
        years of torture and experimentation, his only goal is vengeance. But to
        master his powers he needs a mentor, one that won’t kill him first.
        <br />
        <br />
        Major Jelert Egarro travelled to Burunt to build a better world. But in
        the wrong hands, his skills become a tool of destruction, and those
        hands are everywhere. Jelert must decide whether to stay true to his
        ideals or let others dictate his path.
        <br />
        <br />
        Lady Amara Khar rose fast when her once-powerful family fell. Sharp and
        ruthless, she’s kept her house alive through illicit trade, but clawing
        back power in Burunt means making enemies and unsavory friends.
        <br />
        <br />
        In the fight for power, justice, and survival, everyone must decide: who
        they will become?
      </>
    ),
    shortBlurb:
      "Nearly a decade under the empire’s grip has left Burunt a troubled land, its unrest simmering beneath a fragile surface. In the fight for power, justice, and survival, everyone must decide: who they will become?",
    quote: (
      <>
        "A fantastic debut novel that is brimming with characters as captivating
        as magical crystals and a world that is equal parts hopeful and dark."
        <br />
        &mdash; Adrian M Gibson, award winning author of Mushroom Blues
      </>
    ),
    release: "February 2026",
    status: BOOK_STATUS.EDITING_STAGE,
    genres: ["Nobledark Fantasy", "Political Intrigue", "Action Adventure"],
    icon: <GiCrystalGrowth />,
    cover: "/src/assets/crownfall_cover.jpeg",
    link: "/books#crownfall", // Should link to the book page in the store
  },
  {
    id: 2,
    title: "Chrono-Stained",
    subtitle: "Claim your past. Change your future.",
    quote: "",
    release: "TBA",
    status: BOOK_STATUS.IN_DEVELOPMENT,
    color: "bg-gray-600",
    genres: ["Time Travel", "Sci-Fantasy", "Action Adventure"],
    icon: <GiClockwork />,
    blurb: (
      <>
        This story follows two half-brothers who attempt to travel back in time
        to save their mother from a car accident only to uncover a shocking
        truth: their mother never died.
        <br />
        <br />
        Desperate for answers, the brothers agree to work for a shadowy
        organization in exchange for its resources—despite deep suspicions about
        its true motives. Their mission to find their mother soon unearths a
        plot to destroy the city.
        <br />
        <br />
        Though the conspiracy runs deeper than they imagined, pointing to
        dangerous secrets at the highest levels of government.
      </>
    ),
    shortBlurb:
      "Two half brothers travel back in time to save their mother from a fatal accident only to discover that she never died. Snapped back to their present, the adventure begins to find their mother and to ask her where has she been this whole time.",
    cover: "",
    link: "/books#chrono-stained", // Should link to the book page in the store
  },
];
