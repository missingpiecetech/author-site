/*
 * "From the Writing Desk" on the Home page: one row per work in progress,
 * shown in this order.
 *
 * To add a work, copy an entry and change it. To update one, edit its fields:
 *   title:   the working title, e.g. "Book Two: The Iron Crown"
 *   status:  where it stands, e.g. "Outlining", "First draft", "Editing"
 *   percent: how far along, a number from 0 to 100 (shown as "40%" and a gold
 *            bar). Use null to show the status only, with no number or bar.
 * Remove an entry to drop it from the page; with no entries the section hides.
 *
 * `updated` is an optional month for the intro ("Updated October 2026");
 * leave it "" to leave the date out.
 */
export const updated = "";

const WRITING_DESK = [
  {
    title: "Project: Arcanist",
    status: "Worldbuilding",
    percent: null,
  },
];

export default WRITING_DESK;
