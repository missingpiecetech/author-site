# Analytics events

The site sends events to Minilytics (`https://analytics.missingpiecetech.com`, site
`michael_vadney_author`, strict privacy mode: no cookies or storage) through `track()` in
`client/src/lib/analytics.js`. Every event name is a key of the `EVENTS` map in that file;
call sites use `EVENTS.X`, never a string, so `grep -rn "EVENTS\." client/src` lists every
place an event fires.

Rules for adding an event:

- Fire it after the action succeeds, never on failure (`checkout_error` is the one event
  about a failure). `track()` catches tracker errors and does nothing when the tracker
  scripts are absent or blocked, so it cannot break or delay the action.
- Properties carry only ids, counts, formats and enum-like values. Never send names,
  emails, free text or search terms. The tracker also drops any property whose name
  contains `password`, `token`, `secret`, `email`, `phone`, `address` or `card`, so do not
  name a property that way.
- Use a snake_case name, add it to `EVENTS`, and add a row to the table below.

## Loading

`client/vite/minilyticsPlugin.js` adds `minilytics.js` (with `data-site-id`,
`data-site-key`, `data-privacy-mode="strict"`) and then `replay/ext.js` to `index.html`,
both deferred, ahead of the app's script, only when `PUBLIC_MINILYTICS_HOST`,
`PUBLIC_MINILYTICS_SITE_ID` and `PUBLIC_MINILYTICS_SITE_KEY` are all set. Only the
committed `client/.env.production` sets them, so `vite build` (Cloudflare Pages
production **and branch previews**) tracks, while `npm run dev` and the test suites load
nothing. The site key is public by design.

**Page views** are the tracker's own: one on load, then one on every
`history.pushState` / `replaceState` / `popstate` that changes the path or query, which is
every React Router navigation. There is no `data-hash-routing` (the site uses
`BrowserRouter` paths), so the excerpt's `#chapter-N` hash changes are not page views;
`excerpt_chapter_view` covers them. The tracker also sends `outbound_click` (target host
and link text) for every link to another host, `file_download` for same-site file links,
and `_ml_engaged` after 10 visible seconds. The page view of a route change is sent before
the new page renders, so it carries the previous page's `document.title` (only the excerpt
page sets its own title); paths are always right.

There are no accounts on the site, so nothing calls `minilytics.identify`.

## Session replay

`REPLAY_SETTINGS` in the same file: every visit is eligible (`sampleRate: 1`), a recording
is kept after 20 seconds of visible time, or at once on `checkout_started`, `add_to_cart`,
`excerpt_buy_click` or `newsletter_opened`. No cap or limit on recording. Payment happens
on Square's hosted page, so no element of this site shows payment details and nothing
carries `rr-block`; the MailerLite signup form renders in a MailerLite iframe, which the
recorder does not capture.

## Excerpt reading depth

`client/src/lib/excerptReading.js` (pure; unit-tested with a fake clock) and
`client/src/hooks/useExcerptReading.js` (wires it to the selected chapter tab), from issue
#17:

- Each chapter is split into blocks of whole paragraphs, as close to 500 words as
  paragraph boundaries allow (a last block under 250 words joins the one before).
- Reading time builds while a paragraph has at least half of itself in the reading zone
  (the middle 60% of the viewport), the tab is visible and the reader is active. Each
  moment is **shared among the paragraphs in the zone by their words**, so a screen
  holding four paragraphs earns one second per second, not four.
- Active: a scroll, key, touch or pointer movement within the idle window, which is the
  time to read the words on screen at 250 words a minute plus 50%, at least 60 seconds
  and at most 3 minutes.
- A block is **reached** when its first paragraph touches the reading zone, and **read**
  once its paragraphs hold 60% of its reading time (words ÷ 250 per minute).
- A **skim** is the page moving forward 1.5 screens or more within half a second (three
  screens a second, the End key, a scrollbar drag or a fling) while the block under the
  middle of the screen changes. Moving back up is never a skim.
- Each chapter is viewed, and each block reached and read, at most once per page load,
  however often the reader switches tabs.

## Events

| Event                      | Where it fires                                                                                                                                                                                                             | Properties                                                                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `add_to_cart`              | `pages/StorePage.jsx` `onAddToCart`, after the item is in the cart (Crownfall listing and grid cards)                                                                                                                      | `item_id` (Square item id), `format` (`hardcover`/`paperback`, null off Crownfall), `signed` (boolean, null off Crownfall), `quantity` (always 1) |
| `cart_opened`              | Header cart button (`placement: "header"`, only when it opens), the mobile menu's Cart (`"mobile_menu"`), the store stepper's Go to cart (`"store"`)                                                                       | `placement`, `item_count`                                                                                                                         |
| `cart_quantity_changed`    | Quantity +/− in the cart panel (`placement: "cart"`) or on a store product (`"store"`)                                                                                                                                     | `item_id`, `quantity` (the new quantity; 0 removed the line), `placement`                                                                         |
| `checkout_started`         | `components/ShoppingCart.jsx` `onCheckout`, after Square returned the payment link and before the redirect                                                                                                                 | `item_count`, `subtotal_cents` (before shipping and tax)                                                                                          |
| `checkout_error`           | `onCheckout`, when creating the payment link failed                                                                                                                                                                        | `reason` (`network` or `server`)                                                                                                                  |
| `edition_selected`         | `components/store/CrownfallListing.jsx`, a format or edition pill changed the selection                                                                                                                                    | `axis` (`format` or `signing`), `format`, `signed` (the resulting selection)                                                                      |
| `retailer_click`           | `RetailerLinks` (Home hero `home_hero`, `/books` `books`, the excerpt's buy band `excerpt_chapter_<n>`), the store's shipping notice (`store_notice`) and ebook line (`store_ebook`), the footer Goodreads icon (`footer`) | `retailer` (`direct`, `amazon`, `goodreads`), `placement`                                                                                         |
| `newsletter_opened`        | `JoinCircleButton`, once the MailerLite popup was asked to open: header (`header`), mobile menu (`mobile_menu`), the Subscribe band (`newsletter`)                                                                         | `placement`                                                                                                                                       |
| `podcast_link_click`       | Home's Watch on YouTube (`placement: "home"`); `/podcast`'s Spotify and YouTube links and its X and YouTube tiles (`"podcast"`)                                                                                            | `platform` (`spotify`, `youtube`, `x`), `placement`                                                                                               |
| `social_link_click`        | Footer social icons (`placement: "footer"`), About's social tiles (`"about"`)                                                                                                                                              | `network` (`youtube`, `instagram`, `x`, `bluesky`, `threads`), `placement`                                                                        |
| `contact_email_click`      | `/contact` email links                                                                                                                                                                                                     | `channel` (`business` or `podcast`)                                                                                                               |
| `press_kit_click`          | Footer Press Kit (`placement: "footer"`), About's Press kit button (`"about"`)                                                                                                                                             | `placement`                                                                                                                                       |
| `excerpt_chapter_view`     | `/books/crownfall/excerpt`, the first time a chapter is the shown tab in a page load (on load, a tab click or Next chapter)                                                                                                | `chapter`                                                                                                                                         |
| `excerpt_block_reached`    | The block's first paragraph touched the reading zone                                                                                                                                                                       | `chapter`, `block` (1-based), `words`                                                                                                             |
| `excerpt_block_read`       | The block held 60% of its reading time                                                                                                                                                                                     | `chapter`, `block`, `seconds` (active reading seconds from reached to read)                                                                       |
| `excerpt_skim`             | A fast forward pass or jump ended on a later block                                                                                                                                                                         | `chapter`, `from_block`, `to_block`                                                                                                               |
| `excerpt_chapter_complete` | The chapter's last block was read                                                                                                                                                                                          | `chapter`                                                                                                                                         |
| `excerpt_next_click`       | A chapter's Next chapter button                                                                                                                                                                                            | `from`, `to` (chapter numbers)                                                                                                                    |
| `excerpt_buy_click`        | The buy band after the last chapter (also sends `retailer_click`)                                                                                                                                                          | `chapter`, `retailer` (`direct`, `amazon`, `goodreads`)                                                                                           |
| `excerpt_copy`             | Copying text from a chapter; the clipboard's plain and HTML text get "Excerpt from Crownfall by Michael Vadney, michaelvadney.com" appended, and copying is never blocked                                                  | `chapter`, `block` (where the selection starts), `characters` (copied, without the credit)                                                        |

## Not instrumented

- Sign-up, login, logout and identify: the site has no accounts.
- Outbound links in general: the tracker's own `outbound_click` already covers every link
  to another host; the events above add the site's own placement and enum values.
- A purchase-completed event: `/checkout/success` can be opened without paying, so a visit
  there is not proof of a purchase.

## Checking it

`node client/scripts/analytics-debug.mjs` (from a checkout without `.env.local`) builds
for production, turns on `data-debug` in that scratch build only, and walks Home, the
excerpt, the store and checkout with the real tracker, printing each event sent and the
host's answer. The host answers 403 to `127.0.0.1` until **Accept events from localhost**
is on in the dashboard (Settings → Tracking); turn it off again afterwards. The deployed
domain must be in **Allowed domains**.

`npm run test:e2e` (`client/tests/e2e/analytics.e2e.test.js`) drives every event above
with a stand-in `window.minilytics` and a test clock; the real tracker never loads in
tests.
