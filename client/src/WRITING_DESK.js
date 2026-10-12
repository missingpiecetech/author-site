/*
 * "From the Writing Desk" on the Home page: one row per work in progress,
 * shown in this order.
 *
 * To add a work, copy an entry and change it. To update one, edit its fields:
 *   title:   the working title, e.g. "Book Two: The Iron Crown"
 *   type:    the kind of work, e.g. "Novel", "Novella", "Short Story"
 *   status:  where it stands, e.g. "Outlining", "First draft", "Editing"
 *   percent: how far along, a number from 0 to 100 (shown as "40%" and a gold
 *            bar). Use null to show no number and no bar.
 * Each row reads "type · status · percent", e.g.
 * "Short Story · Awaiting publishing · 100%". Any of the three can be left
 * out (delete the line, or use "" / null) and the rest close up around it.
 * Remove an entry to drop it from the page; with no entries the section hides.
 *
 * `updated` is an optional month for the intro ("Updated October 2026");
 * leave it "" to leave the date out.
 */
export const updated = "";

const WRITING_DESK = [
  {
    title: "Project: Arcanist",
    type: "Novel",
    status: "Worldbuilding & outlining",
    percent: 5,
  },
  {
    title: "Grim Arithmetic",
    type: "Short Story",
    status: "Awaiting publishing",
    percent: 100,
  },
  {
    title: "Tempest (working title)",
    type: "Short Story",
    percent: 40,
  },
];

export default WRITING_DESK;
