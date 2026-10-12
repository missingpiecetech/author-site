import { GiCrystalGrowth, GiClockwork } from "react-icons/gi";

import crownfallCover from "/src/assets/crownfall_cover_web.jpg";

export const BOOK_STATUS = {
  IN_DEVELOPMENT: "Worldbuilding & outlining",
  OUTLINE_STAGE: "Outlining",
  WRITING_STAGE: "Writing",
  EDITING_STAGE: "Editing",
  COMING_SOON: "Coming Soon",
  PRE_ORDER: "Available for Pre-order",
  RELEASED: "Out Now",
};

export const BOOKS = [
  {
    id: 1,
    slug: "crownfall",
    title: "Crownfall",
    subtitle: "Trust is the hardest Lesson",
    blurb: (
      <>
        Nearly a decade under the empire’s grip has left Burunt a troubled land.
        <br />
        <br />
        Kyndel Heim knows the truth behind the Viceroy’s rise to power. After
        years of torture, his only goal is vengeance, but to master his powers
        he needs a mentor, one that won’t kill him first.
        <br />
        <br />
        Major Jelert Egarro came to Burunt to build something better. Instead,
        his talents have become weapons in the wrong hands—and those hands are
        everywhere. He must choose between his ideals or survival.
        <br />
        <br />
        Lady Amara Khar must renew her family’s legacy. Sharp and ruthless,
        she’s kept her house alive through smuggling and shadow deals, but
        reclaiming power means making allies as dangerous as her enemies.
        <br />
        <br />
        In the struggle for power, justice, and survival, each of them must
        decide who they’re willing to become.
      </>
    ),
    shortBlurb:
      "Nearly a decade under the empire’s grip has left Burunt a troubled land, its unrest simmering beneath a fragile surface. In the fight for power, justice, and survival, everyone must decide: who they will become?",
    praise: [
      {
        text: "An excellent debut novel. Crownfall brims with a captivating cast of complex characters and a mesmerizing world of hope and darkness.",
        name: "Adrian M Gibson",
        credit: "award winning author of Mushroom Blues",
      },
      {
        text: "Crownfall had me on the edge of my seat from the first page to the last. This is a masterclass in political fantasy that I couldn't put down!",
        name: "Greta Kelly",
        credit: "author of The Queen of Day's and The Frozen Crown",
      },
      {
        text: "A compelling debut that needs to be on your TBR.",
        name: "M.J. Kuhn",
        credit: "internationally bestselling author of Among Thieves",
      },
    ],
    retailers: {
      amazon: "https://www.amazon.com/dp/1972175009",
      goodreads: "https://www.goodreads.com/book/show/249506475-crownfall",
    },
    // Home hero eyebrow. Crownfall is a standalone, not part of a series.
    heroEyebrow: "A standalone dark epic fantasy · Available now",
    // Opening of the book for Home's "Read an Excerpt" section, which stays
    // hidden while `paragraphs` is empty. One string per paragraph (the first
    // 150 to 200 words, ending on a small cliffhanger). `note` is an optional
    // line under the heading; `link` is an optional "Keep reading" URL.
    excerpt: {
      chapter: "Chapter One",
      paragraphs: [],
      note: "",
      link: "",
    },
    release: "April 2026",
    status: BOOK_STATUS.RELEASED,
    genres: ["Nobledark Fantasy", "Action & Adventure", "Political Intrigue"],
    icon: <GiCrystalGrowth />,
    cover: crownfallCover,
    link: "/books#crownfall", // Should link to the book page in the store
  },
  {
    id: 2,
    slug: "project-arcanist",
    // title: "Chrono-Stained",
    title: "Project: Arcanist",
    subtitle: "Claim your past. Change your future.",
    praise: [],
    release: "TBA",
    status: BOOK_STATUS.IN_DEVELOPMENT,
    // genres: ["Time Travel", "Sci-Fantasy", "Action Adventure"],
    icon: <GiClockwork />,
    // blurb: (
    //   <>
    //     Two half-brothers risk everything to rewrite history and save their
    //     mother from a tragic accident—only to discover she never died at all.
    //     <br />
    //     <br />
    //     Driven by hope and suspicion, they join a mysterious organization
    //     offering the means to uncover the truth. But as they dig deeper, the
    //     brothers find themselves entangled in a web of secrets, conspiracies,
    //     and a looming threat that could destroy their city.
    //     <br />
    //     <br />
    //     Their journey will test their loyalty, challenge their beliefs, and
    //     force them to confront the shadows of their own past.
    //   </>
    // ),
    //  blurb: (
    //   <>
    //     This story follows two half-brothers who attempt to travel back in time
    //     to save their mother from a car accident only to uncover a shocking
    //     truth: their mother never died.
    //     <br />
    //     <br />
    //     Desperate for answers, the brothers agree to work for a shadowy
    //     organization in exchange for its resources—despite deep suspicions about
    //     its true motives. Their mission to find their mother soon unearths a
    //     plot to destroy the city.
    //     <br />
    //     <br />
    //     Though the conspiracy runs deeper than they imagined, pointing to
    //     dangerous secrets at the highest levels of government.
    //   </>
    // ),
    blurb:
      "Two brothers defy time itself to save their mother, only to uncover a conspiracy that threatens everything. Fullmetal Alchemist Brotherhood meets The Licanius Trilogy. More details coming as development progresses.",
    shortBlurb:
      "Two brothers defy time itself to save their mother, only to uncover a conspiracy that threatens everything. Fullmetal Alchemist Brotherhood meets The Licanius Trilogy. More details coming as development progresses.",
    // "Two half brothers travel back in time to save their mother from a fatal accident only to discover that she never died. Snapped back to their present, the adventure begins to find their mother and to ask her where has she been this whole time.",
    cover: "",
    link: "/books#project-arcanist", // Should link to the book page in the store
  },
];
