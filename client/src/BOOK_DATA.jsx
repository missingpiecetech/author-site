import { GiCrystalGrowth, GiClockwork } from "react-icons/gi";

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
        Kyndel Heim knows the truth behind the Viceroy’s rise to power. After
        years of torture and experimentation, his only goal is vengeance. But to
        master his powers he needs a mentor, one that won’t kill him first.
        <br />
        Major Jelert Egarro travelled to Burunt to build a better world. But in
        the wrong hands, his skills become a tool of destruction, and those
        hands are everywhere. Jelert must decide whether to stay true to his
        ideals or let others dictate his path.
        <br />
        Lady Amara Khar rose fast when her once-powerful family fell. Sharp and
        ruthless, she’s kept her house alive through illicit trade, but clawing
        back power in Burunt means making enemies and unsavory friends.
        <br />
        In the fight for power, justice, and survival, everyone must decide: who
        they will become?
      </>
    ),
    shortBlurb:
      "Nearly a decade under the empire’s grip has left Burunt a troubled land, its unrest simmering beneath a fragile surface. In the fight for power, justice, and survival, everyone must decide: who they will become?",
    quote:
      "In the fight for power, justice, and survival, everyone must decide: who they will become?",
    release: "February 24, 2026",
    status: "Coming Soon",
    statusColor: "from-emerald-500 to-teal-600",
    coverColor: "from-slate-700 via-gray-800 to-slate-900",
    genres: ["Nobledark Fantasy", "Political Intrigue", "Action Adventure"],
    icon: <GiCrystalGrowth className="text-white text-6xl " />,
    cover: "/src/assets/crownfall_cover.jpeg",
    link: "/books#crownfall", // Should link to the book page in the store
  },
  {
    id: 2,
    title: "Chrono-Stained",
    subtitle: "A family torn by time",
    // summary:
    //   "A thrilling adventure through time where past and future collide in unexpected ways. Fullmetal Alchemist meets the Licanius Trilogy in this upcoming fantasy epic.",
    // fullSummary:
    //   "When the fabric of time itself becomes a battlefield, heroes must navigate through fractured realities to save not just their world, but all possible worlds. Every choice echoes across timelines, and every decision could unravel existence itself.",
    quote: "Time is not a river, but a storm—and we are all caught in its eye.",
    release: "TBA",
    status: "Outlining & Worldbuilding",
    color: "bg-gray-600",
    genres: ["Time Travel", "Sci-Fantasy", "Action Adventure"],
    icon: <GiClockwork className="text-white text-6xl" />,
    blurb: "",
    shortBlurb:
      "Two half brothers travel back in time to save their mother from a fatal accident only to discover that she never died. Snapped back to their present, the adventure begins to find their mother and to ask her where has she been this whole time.",
    cover: "",
    link: "/books#chrono-stained", // Should link to the book page in the store
  },
];
