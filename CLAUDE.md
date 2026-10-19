# Michael Vadney Author Site

Marketing and storefront website for fantasy author / podcaster Michael Vadney
(michaelvadney.com). Showcases books (Crownfall, Project: Arcanist), the "Author Adjacent"
podcast, about/contact info, and a Square-backed store with cart and checkout. Single-page
React app deployed to Cloudflare Pages.

## Tech Stack

- **Framework:** React 19 + React Router 7 (SPA, `BrowserRouter`)
- **Build tool:** Vite 7, `@vitejs/plugin-react`
- **Styling:** Tailwind CSS 4 via `@tailwindcss/postcss`. Tokens live in `src/theme.css`
  (`@theme`). `tailwind.config.js` is v3-style and ignored by Tailwind 4 — don't add to it.
- **State:** Zustand (cart, persisted to localStorage as `author-site-cart`), React Query
  (`@tanstack/react-query`) for data fetching
- **Icons:** FontAwesome + react-icons
- **Commerce:** Square SDK (`square` npm package) — Catalog, Checkout (Payment Links), Customers
- **Newsletter:** MailerLite universal snippet (account `2132252`) loaded in `index.html`
- **Deployment:** Cloudflare Pages, auto-deploys on push to `main`. `wrangler.toml` sets
  `compatibility_flags = ["nodejs_compat"]` (required for Square SDK). Pages project root is
  `client/`, build output `dist/`.
- **Node version:** 20 (pinned via `.nvmrc` at repo root)

## Design System

Dark and bookish: antique gold on near-black, classic serif type. The source design is the
"Fantasy Author Website Concepts" canvas (Home, Store, Podcast, About boards plus a mobile
Home board). The re-skin changed the look only — same pages, same sections, same copy. Mockup
copy appears only in "Join the Circle", "Buy direct", "Buy on Amazon", "Add it on Goodreads",
the store's ebook line, About's "Invite Michael" list and Home's mockup sections (the hero
eyebrow "A standalone dark epic fantasy · Available now", "Read an Excerpt", "From the Writing Desk" / "Stories in
the Works"). **Use the tokens below; never
`primary`/`secondary`/`secondary-dark`, `bg-white` or Tailwind's default palette
(`gray-*`, `red-*`, …); errors use `text-error`.**

### Colors (`src/theme.css`)

| Token          | Value     | Use                                                    |
| -------------- | --------- | ------------------------------------------------------ |
| `ground`       | `#121017` | Page background; text on gold                          |
| `band`         | `#17141d` | Alternate section bands (quotes, writing desk)         |
| `well`         | `#1c1922` | Inset panels, inputs, cart drawer, shipping notice     |
| `surface`      | `#25202c` | Image placeholders                                     |
| `rule`         | `#2c2733` | Header/footer hairlines and list row separators        |
| `edge`         | `#3a3342` | Card / placeholder borders                             |
| `outline`      | `#4a4353` | Secondary (outlined) button border                     |
| `cream`        | `#ece4d4` | Primary text and headings                              |
| `muted`        | `#c9c0ae` | Body copy, ledes                                       |
| `subtle`       | `#b3a996` | Captions, attributions, footer text                    |
| `accent`       | `#cfae6b` | Antique gold: eyebrows, primary buttons, links, frames |
| `accent-hover` | `#e6c98c` | Link/button hover                                      |
| `error`        | `#f87171` | Error text (checkout, store); 6.3:1 on the dark panels |

Primary buttons are gold fill with `ground` text. `outline`/`edge` borders are only ~2:1
against the ground, so never show state with a border alone (the pressed pill uses the fill).

### Typography

- **Display:** Cormorant Garamond (500/600/700, italic 500) — `font-display`; h1–h3 get it
  by default. Headings, the site name, hooks and pull quotes (italic).
- **Body:** Spectral (400/500, italic 400) — `font-body`, the default.
- Self-hosted via `@fontsource/*` imports in `main.jsx` (no Google Fonts link).
- Fluid sizes scale between the 390px and 1440px mockups: `text-display` (book title),
  `text-title` (page h1), `text-heading` (section h2), `text-hook`, `text-quote`,
  `text-lede` (19px), `text-eyebrow` with `tracking-eyebrow`.
- `--header-h` (68px, 96px from `lg`) sizes the header, the cart drawer offset and
  `scroll-padding-top`.

### Patterns

- **Eyebrow:** small uppercase gold label above section headings, using the page's existing
  labels.
- **Sections** alternate `ground` and `band`; 80px side padding on desktop, 24px on mobile,
  content in a `max-w-7xl` column. **No hairline borders on sections** (owner, Oct 2026):
  bands and plain sections have no 1px edges. Only the header's bottom edge and the
  footer's top edge carry a `rule` hairline. Row separators inside lists (`RuleList`, the
  cart, Books' release-date grid, Contact's two response columns) are content, not section
  edges, and stay.
- **Dividers only within a section** (owner, Oct 2026): the **filigree divider**
  (`FiligreeDivider`: the bramble ornament alone, centred, with no rules) separates content
  inside one section: between the Home praise quotes, under a centred page title
  (`PageIntro`), under an excerpt chapter heading and at a scene break. Never on the seam
  between two sections (`Section` has no prop for that).
- **Page titles:** `PageIntro` is always centred (eyebrow, title, lede, then the divider
  in flow under them); the thorny divider only works under a centred title. About's title
  sits beside the portrait, left-aligned, so it gets no divider.
- **Filigree, not plain gold boxes.** The site style is **#8 Thorned Bramble** (owner's
  choice, Oct 2026): tapering briar stems crossing at each corner around a closed bud, with
  hooked thorns; bold, solid `currentColor` fills. **Project: Arcanist's own frames use #10
  Art Deco Sunburst** (stepped bars, lozenges, a sunburst fan; 3px frame line) — today that
  is its cover frame on `/books`. Inline SVG only, no image files or icon fonts.
  - `src/components/ui/Filigree.jsx`: `FiligreeCorners` (parent `relative`) and
    `FiligreeDivider`. Both `aria-hidden`, `pointer-events-none`, and take `filigree` (a
    style name; default the site style). No artwork lives here.
  - **One scale for every thorn** (owner, Oct 2026): `src/components/ui/filigree/scale.js`
    sets `CORNER_SIZE` (112px, at every viewport and on every frame; corners never scale
    with the box) and `UNIT` (1.12px per artwork unit). The bramble divider has no size of
    its own, so it is drawn at `UNIT` too (269×54px): stems and thorns are the same size
    in corners and dividers everywhere. Never resize an ornament with classes
    (`[&_svg]:…`, `max-w-*` on a divider); `design-check` fails any corner or bramble
    divider more than 5% off `UNIT`.
  - `src/components/ui/filigree/bramble.jsx`: the artwork (ported verbatim from symbols
    `c8`/`d8` of the samples, the divider without the sample's rule lines) and its
    metrics: `FRAME_BORDER` (`border-2`) and the inset (a fifth of the corner box sits
    outside the frame line).
  - `src/components/ui/filigree/artDeco.jsx`: Art Deco Sunburst (symbols `c10`/`d10`,
    `border-3`), same exports plus its own divider size (`DIVIDER_ART`) and the solid
    3px `Rule` either side, both unchanged.
  - `src/components/ui/filigree/index.js` names the site style (two marked lines) and
    registers styles by name in `FILIGREE_STYLES` (`bramble`, `artDeco`); `getFiligree(name)`
    returns one, falling back to the site style. Import it as `filigree/index.js`
    (explicitly — on macOS `./filigree` can resolve to `Filigree.jsx`).
  - **One item, its own style:** pass `filigree="artDeco"` to `FramedImage` /
    `FiligreeCorners` / `FiligreeDivider`, and give a hand-built frame
    `getFiligree(name).FRAME_BORDER` so line and corners match. A book takes it from
    `BOOK_DATA` (`filigree: "artDeco"` on Project: Arcanist), which `BooksPage`'s
    `BookCover` passes through. Never change the site style to style one item.
  - Every box carrying corners uses `${FRAME_BORDER}` plus a colour (`border-accent`, or
    `border-edge` on panels). A fifth of the 112px corner (23px) reaches outside the box,
    so keep that much room. A framed box must be at least 1.6 corner sizes (180px) tall
    and wide or the arms on one edge meet; a box smaller than that gets no corners.
  - **No filigree on repeating cards** (owner, Oct 2026: "it is just too much"). Corners go
    only on single framed elements: `FramedImage`, the store gallery frame, the newsletter
    box and the checkout-success panel. Tiles, stats and icon boxes that repeat (Podcast
    connect tiles, About social tiles, the About stats, Contact icon boxes) get no corners
    and no frame line: the tiles are a plain `well` fill, the About stats sit unboxed on
    their band, the Contact icon boxes have a 1px border. No divider on list rows
    (`RuleList`), the lightbox, chips or the left-ruled `BookPraise`.
  - **Notices have no filigree:** `ShippingNotice` is a plain `well` panel with the gold
    warning icon, no frame line and no corners.
  - **Other styles:** `design/filigree-samples/index.html` (repo root, never shipped) holds
    all thirteen candidates; its README gives the steps to port one and switch to it.
- **Buttons:** near-square (`rounded-btn`, 2px), heights 54/48/44. Primary = gold fill;
  secondary = transparent with an `outline` border; toggle pills use `aria-pressed` and the
  gold fill when pressed. Labels in sentence case.
- **Framed images:** covers and author photos sit in a 2px gold frame (3px for Arcanist's
  art deco) with filigree corners,
  an 18px inset (12px on mobile) and `shadow-cover`.
- **Store gallery** (`ProductGallery`): a 2:3 pane (4:3 on grid cards) with the image
  contained. Square's book mockups come on wide transparent canvases with a soft drop
  shadow, so they are cropped to the book at the source with
  `client/scripts/crop-catalog-images.mjs` (reads production, writes crops locally; its
  `--upload-sandbox` puts them on the sandbox mirror); the gallery simply contains them,
  and opaque images such as the wide front+back cover letterbox.
  Previous/next show on hover or keyboard focus where the device can hover, always on
  touch screens.
- **Pull quotes:** large italic Cormorant on a `band`, the attribution in uppercase
  `subtle` directly under it (no divider between them). Several quotes in one band get a
  divider between each pair, none before the first or after the last.
- **Home** follows the mockup: the Crownfall book hero (`BookHero`: framed cover, eyebrow
  the eyebrow from BOOK_DATA `heroEyebrow` (Crownfall is a standalone, never "Book One"), the title as
  the page's h1, subtitle as hook, `shortBlurb` from `sm`, `RetailerLinks`) with the scroll
  cue at its foot; the praise band (every Crownfall quote, big-quote style); "Read an
  Excerpt" (`Excerpt`, from BOOK_DATA crownfall `excerpt` — hidden while `paragraphs` is
  empty); the writing desk; then the Instagram section and Author Adjacent. No author-photo
  hero.
- **Instagram** (`components/instagram/InstagramFeed`, Home only): eyebrow "Latest Updates",
  h2 "Follow" + gold "Along", then Michael's posts as a masonry (owner: "masonry with no
  captions"): CSS columns, 2 on phones and 3 from `lg`, every tile at Behold's own
  width/height (never cropped), srcset from `small`/`medium`/`large`, lazy-loaded, a small
  corner icon on video and album tiles, no filigree (repeating tiles). Under it a primary
  "Follow @<username>" (new tab). A tile opens `InstagramViewer`, a `<dialog>` opened with
  `showModal` (Escape, the close button or a backdrop click closes it; focus returns to the
  tile). From `lg`: media at its own aspect (max 85vh) beside a panel with the date, the
  full caption (line breaks kept) and a secondary "View on Instagram". Below `lg`: full
  screen, media centered on `ground`, close top-right, and over a gradient at the foot the
  date, the caption clamped to two lines (a button with `aria-expanded` that expands it in
  place to a scrollable panel up to 60% of the viewport) and the link. Videos play muted
  and looped (autoplay unless reduced motion); albums are a scroll-snap strip with
  previous/next and "n / total". The section renders nothing while loading, on error or
  with no posts.
- **Excerpt page** (`/books/crownfall/excerpt`, `ExcerptPage`, text from
  `src/excerpts/crownfall.js`): a `PageIntro` whose eyebrow is the count alone ("The first
  three chapters"; "Read an Excerpt" only in the coming-soon state) over the title, with no
  lede; then one chapter at a
  time behind `components/excerpt/ChapterTabs` (WAI-ARIA tabs: automatic activation, roving
  tabindex, Left/Right/Home/End; the selected tab is the gold fill, never a border alone;
  "Chapter 1: Kyndel" from `sm`, "Ch. 1" over "Kyndel" on phones). Each chapter keeps its
  full heading and drop cap. The hash names the chapter (`#chapter-2` opens and scrolls to
  it; no hash is chapter 1) and tab changes `replaceState` it, so history gets no entries.
  Every chapter but the last ends in a primary button named for the next chapter's heading
  ("Chapter 2: Jelert", with a visually hidden "Next: " prefix) that shows the next tab,
  focuses its panel and jumps (never smooth-scrolls) its top under the header, beside a secondary "Buy the book" (`/store`; stacked full width on phones).
  After the last chapter, and only then, the buy band ("Keep reading
  Crownfall" + `RetailerLinks`, no eyebrow) shows on `band`, a step lighter than `ground`.
- **Writing desk** ("From the Writing Desk", `WritingDesk`): one `WorkProgress` row per entry
  in `src/WRITING_DESK.js` (`{ title, type, status, percent }`, edited by hand) — title, then
  "type · status · N%" (any missing part skipped, no stray separator; under the title below
  `lg`, beside it from `lg`) and a gold bar on a `rule` track (`role="progressbar"`,
  aria-valuenow/min/max). `percent` is clamped to 0–100; `null` hides the number and bar.
  A `band` when it follows the excerpt, plain when it would sit against the praise band.
- **Lists** (episodes, contact rows, links) are rows divided by `rule` lines, not cards.
- **Retailer links:** the Home hero and `/books` show `RetailerLinks` (Buy direct →
  `/store`, Buy on Amazon, Add it on Goodreads); the Store shows `ShippingNotice` (US-only
  shipping, then "Available globally on Amazon." with "Amazon" linked, new tab) above all
  products; the footer links Goodreads. Retailer URLs live in `BOOK_DATA` (`retailers`).
- **Motion is kept, behind `prefers-reduced-motion`.** AOS and the keyframe classes in
  `index.css` (`animate-fade-in-up`, `animate-slide-in-*`, `delay-*`, …) stay. No floating
  circles or other background shapes. Every keyframe and `opacity: 0` start state
  lives inside `@media (prefers-reduced-motion: no-preference)`; AOS is initialised with
  `disable: () => matchMedia("(prefers-reduced-motion: reduce)").matches`; Tailwind animations
  use `motion-safe:`; no parallax under reduced motion. The e2e fails if any content is left
  at opacity 0 with reduced motion on.
- **Background art** (Michael's paintings) goes behind short, large text and calls to
  action, never behind body copy. Placements: every centred page title but Podcast's
  (`PageIntro background`: Books `characters`, Store `skyline`, Contact `cliffs`, the
  excerpt `city`, checkout success `harren`), the Home praise band (`cracks`) and the
  site-wide newsletter (`crystal`). Podcast's title stays plain (it has a different feel).
  **Keep washes light** (owner, Oct 2026: the earlier ones were "always too dark"): the
  art carries a light wash over most of its area, and legibility comes from a darker pool
  sized to the text instead: `PageIntro`'s default scrim is a radial pool around the title
  block, each Home quote sits on its own soft radial pool over a 35% wash, and the
  newsletter text sits in its `bg-ground/90` box over a 45% wash (heavier there so the
  crystal does not run into the gold frame). `<Section background={BACKGROUNDS.name}
scrim="…" fade priority>` draws the art as a decorative `<img>` cropped to fill
  (`priority` loads it at once, for art at the top of a page; `fade` fades its foot into
  `ground`). Art lives in `src/assets/backgrounds/` as two WebP widths made by
  `node scripts/optimize-backgrounds.mjs <source-dir> <name>…` from
  `<name>_background.png`; the full-size PNGs stay out of the repo. `index.js` registers
  each with the object-position classes that keep its subject in view. `design-check`
  fails text on art below WCAG contrast against the brightest rendered pixel next to its
  letters.
- Sections with horizontal entrance animations use `<Section clipX>` (`overflow-x-clip`).
- Every layout must work at 390px with no horizontal scroll.
- Instagram lives on Home (above); About has no feed and there is no appearances list.

### Building blocks

- `src/components/ui/`: `Section` (`band`, `clipX`, `spacing`, `background`, `scrim`),
  `FiligreeCorners` / `FiligreeDivider` (`Filigree.jsx`; artwork in `filigree/`), `Eyebrow`, `Button`
  (`variant` primary/secondary/pill, `size` lg/md/sm, `to`/`href`, `pressed`, `block`),
  `FramedImage` (`aspect`, `placeholder`, `filigree`), `PullQuote` (`quote`, `name`, `credit`),
  `RuleList`/`RuleRow` (`to`/`href`, `arrow`), `PageIntro` (`eyebrow`, `title`, `accent`,
  `lede`).
- `src/components/`: `RetailerLinks` (`compact`), `ShippingNotice`, `JoinCircleButton`
  (opens the MailerLite popup), `WritingDesk` / `WorkProgress`, `home/BookHero`,
  `home/Excerpt`, `instagram/InstagramFeed` / `InstagramViewer`, plus the restyled `Navigation`, `Footer`, `NewsLetter`,
  `Socials`, `ShoppingCart`.
- `src/hooks/useInstagramFeed.js`: React Query over `/api/instagram`, no retries (a failed
  feed is not cached, so a retry would spend a Behold request).
- `src/hooks/useHashScroll.js`: call it on pages with `#section` links (`/#crownfall`,
  `/books#<slug>`); the header skips scroll-to-top when the URL has a hash.
- `src/SITE_INFO.js`: name, tagline, location, domain, emails, press kit, newsletter form id and
  `shipping.usOnly` (the switch that shows `ShippingNotice`).

## Analytics

Minilytics, loaded only by production builds (`client/.env.production` +
`client/vite/minilyticsPlugin.js`; dev and tests load nothing, branch previews track).
Every event goes through `track()` and the `EVENTS` map in `src/lib/analytics.js`; excerpt
reading depth lives in `src/lib/excerptReading.js`. **`docs/ANALYTICS.md`** has the rules
and one row per event (where it fires, its properties): add a row with every new event.
`node scripts/analytics-debug.mjs` shows what the real tracker sends from a production
build.

## Repo Layout

Everything lives under `client/`. The repo root only has the README, DEPLOYMENT.md, `.nvmrc`,
`.gitignore`, `.prettierignore` and `design/` (reference material that never ships: the
filigree samples, the Instagram layout mockups).

```
author-site/
├── .nvmrc                    # Node 20
├── README.md
├── DEPLOYMENT.md             # Cloudflare Pages setup walkthrough
└── client/                   # All app code lives here — run npm commands from this dir
    ├── index.html            # SPA shell; loads MailerLite snippet
    ├── vite.config.js        # Registers the Square and Instagram dev middleware
    ├── vite/minilyticsPlugin.js  # Adds the Minilytics scripts when PUBLIC_MINILYTICS_* are set
    ├── .env.production       # PUBLIC_MINILYTICS_* (committed; nothing secret)
    ├── wrangler.toml         # Cloudflare Pages config (nodejs_compat)
    ├── .env.example          # SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, SQUARE_ENVIRONMENT
    ├── public/
    │   └── _redirects        # "/* /index.html 200" — SPA routing on Cloudflare
    ├── shared/
    │   └── instagramFeed.js      # Behold feed URL, fetch + trim; used by both /api/instagram
    ├── api/
    │   ├── squareApiPlugin.js    # Vite dev-server middleware for /api/square/*
    │   └── instagramApiPlugin.js # Dev twin of /api/instagram (12-hour in-memory cache)
    ├── functions/
    │   ├── api/instagram.js      # GET /api/instagram (prod; 12-hour edge cache)
    │   └── api/square/           # Cloudflare Pages Functions (prod /api/square/*)
    │       ├── catalog.js        # GET  /api/square/catalog
    │       ├── checkout.js       # POST /api/square/checkout
    │       └── customers.js      # POST /api/square/customers
    └── src/
        ├── main.jsx
        ├── App.jsx               # Router + QueryClientProvider + Layout
        ├── index.css, theme.css
        ├── BOOK_DATA.jsx         # Static book metadata (slug, praise, retailers, excerpt)
        ├── WRITING_DESK.js       # Home "From the Writing Desk" rows, edited by hand
        ├── SOCIAL_LINKS.jsx      # Static social link data
        ├── SITE_INFO.js          # Site constants (emails, press kit, shipping switch)
        ├── assets/               # Author photos, book covers, podcast logos
        ├── components/           # Layout, Navigation, Footer, ShoppingCart, ...
        │   └── ui/               # Section, Eyebrow, Button, FramedImage, PullQuote, ...
        ├── lib/                  # analytics.js (track, EVENTS), excerptReading.js
        ├── pages/                # One file per route: / /books /podcast /about /store
        │                         #   /contact /checkout/success
        └── hooks/
            ├── useCart.js         # Zustand cart store (persisted)
            ├── useExcerptReading.js # Excerpt reading depth on the selected chapter
            ├── useHashScroll.js   # Scroll to location.hash after render
            └── useSquare.js       # Fetches /api/square/* + maps catalog → products
```

## NPM Scripts

Run from `client/`.

| Command             | Purpose                                                                                                          |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `npm run dev`       | Vite dev server (default http://localhost:5173)                                                                  |
| `npm run build`     | Production build to `client/dist/`                                                                               |
| `npm test`          | Unit, then e2e                                                                                                   |
| `npm run test:unit` | Vitest: both checkout implementations (Square SDK mocked); Instagram trim and edge cache                         |
| `npm run test:e2e`  | Puppeteer: /store → cart → checkout, Home Instagram viewer, desktop + 390px, no horizontal scroll on every route |
| `npm run preview`   | Serve the production build locally                                                                               |
| `npm run lint`      | ESLint                                                                                                           |

`node scripts/design-check.mjs [--shots <dir>] [--shots-only]` drives every route at 1440 and
390 on the e2e harness (the excerpt once per chapter tab, as `#chapter-N`): horizontal scroll, filigree overlapping text, filigree corners meeting
each other or their frame's content, every ornament at the corners' scale, reduced-motion opacity,
progress bars against their aria-valuenow, text contrast over background art, the Home scroll cue's geometry, and (with
`--shots`) the element screenshots listed in its `SHOTS`.

## Instagram feed — `/api/instagram`

Michael's posts come from his Behold JSON feed (`BEHOLD_FEED_URL` in
`client/shared/instagramFeed.js`; public, not a secret). Behold's free plan gives 6 posts,
refreshed daily, and **1,200 requests a month, counting every fetch of the feed URL**, so
browsers never fetch it. `GET /api/instagram` fetches it server-side, trims it to the fields
the site draws (`trimFeed`: username; each post's id, mediaType, mediaUrl, caption,
prunedCaption, permalink, timestamp, `small`/`medium`/`large` sizes, and album children) and
caches it for 12 hours (the edge cache is per data center, so each one refetches on its
own; Behold only refreshes daily): the Pages Function `client/functions/api/instagram.js` in the edge
Cache API (`caches.default`, keyed on the path so a query string cannot bypass it), its dev
twin `client/api/instagramApiPlugin.js` in memory. Both import the shared module, so the URL
and trim cannot drift. A Behold failure answers 502 with an error naming the cause and is not
cached. A VIDEO post's `mediaUrl` is the signed, expiring video file on Instagram's CDN; the
12-hour refetch keeps it fresh.

## Square API — Two Implementations, Same Routes

The `/api/square/*` endpoints have **two parallel implementations** that must stay in sync:

| Environment             | Code path                                                                       |
| ----------------------- | ------------------------------------------------------------------------------- |
| `vite dev` (local)      | `client/api/squareApiPlugin.js` — Vite `configureServer` middleware             |
| Cloudflare Pages (prod) | `client/functions/api/square/{catalog,checkout,customers}.js` — Pages Functions |

Routes:

- `GET  /api/square/catalog` → lists `ITEM` + `IMAGE` catalog objects
- `POST /api/square/checkout` → creates a Square Payment Link
- `POST /api/square/customers` → creates a Square customer

Both implementations serialize BigInts as strings. The client (`useSquare.js`) expects the
dev-server shape — when adding fields, update both files together.

### Shipping fee — do not remove

Checkout always asks for a shipping address and adds a flat **$5.99 "Shipping"** fee
(`checkoutOptions.shippingFee`, `599` cents USD) server-side in both implementations. The
client's `askForShippingAddress`/pickup flag is ignored. Changing or dropping the fee is a
business decision, not a refactor.

## Tests

`client/tests/` locks the money path. Run `npm test` before any change to the store, cart,
navigation or Square code.

- **Unit** (`tests/unit/`): asserts the exact `paymentLinks.create` call in both Square
  implementations (shipping fee, address prompt, line items) and fails if their
  `checkoutOptions` drift apart. The one known drift (`squareMarketingOptIn` in dev only) is
  listed in the test.
- **Instagram** (`tests/unit/instagram.test.js`): the trim against the fixture, and the
  Pages Function's edge cache (one Behold fetch per 12 hours, query strings share the entry)
  and 502, with `fetch` and `caches` mocked. `tests/e2e/instagram.e2e.test.js` drives Home
  at desktop and 390px: one tile per post at the fixture's `medium` size, the video viewer
  (`src`, poster, Instagram link), album slides and count, the phone caption's two-line
  clamp and expand, Escape/close returning focus to the tile, and nothing rendered on a 502.
- **E2E** (`tests/e2e/`): starts the real `vite` CLI on a free port with the `square` package
  swapped for an in-process stub (`support/register-square-stub.mjs`) — nothing reaches
  Square, and inherited `SQUARE_*` env vars are stripped. Drives /store → cart → checkout for
  each of the four Crownfall editions and a grid product at desktop and 390px (cart line,
  checkout body and Square line item carry the right item/variation ID and price, plus the
  $5.99 shipping fee), and checks every route for horizontal scroll at 390px and, with
  `prefers-reduced-motion: reduce`, for content left at opacity 0 or still animating.
  The harness sets `INSTAGRAM_FEED_FIXTURE` to `support/instagram-fixture.json` (built from
  the live feed: IMAGE, VIDEO and CAROUSEL_ALBUM posts), so the dev twin serves it instead
  of calling Behold, and its media URLs point at `/api/instagram/fixture-media/<w>x<h>.svg`
  placeholders the twin draws. Nothing in the suite or `design-check` reaches Behold or
  Instagram.
- **Crownfall editions are mapped by Square item ID, never by name.** Square holds four
  separate items (signed/unsigned × hardcover/paperback); `src/data/crownfallEditions.js`
  maps each combination to its production and sandbox item IDs and exports
  `partitionCatalog` (catalog → one product per combination + grid products). The stub
  catalog (`support/square-stub-products.js`) uses the production IDs, so a changed ID in the
  table fails the suite. Missing-edition cases serve the stub catalog with items removed
  (`openPage(viewport, { dropItemIds })`): a value with no available pairing has a disabled
  toggle; a single missing pairing is never selected (the other toggle flips); with no
  mapped item there is no listing and everything goes to the grid. If Square items are ever
  recreated, update the table and the stub together.
- **The e2e selects only by `data-testid`.** Restyle freely, but keep these hooks:
  `store-product` (+ `data-product-id`; on the Crownfall listing it is the selected
  edition's item ID), `add-to-cart`, `qty-increase`, `qty-decrease`, `qty-value`,
  `edition-format-hardcover`, `edition-format-paperback`, `edition-signed`,
  `edition-unsigned` (pills with `aria-pressed`), `cart-toggle`, `cart-count`, `cart-panel`
  (+ `data-state`), `cart-close`, `cart-item`, `cart-subtotal`, `checkout-button`,
  `checkout-error`, `mobile-menu-toggle`, `mobile-cart-button`; on the excerpt,
  `excerpt-chapter` (each tab panel; inactive ones `hidden`), `excerpt-chapter-nav` (the
  tablist), `excerpt-tab-1`…`excerpt-tab-3` (by chapter number), `excerpt-next`,
  `excerpt-buy` (the "Buy the book" beside it), `excerpt-end`, `excerpt-text`, `excerpt-coming-soon`, and Home's `excerpt-keep-reading`; Home's Instagram section:
  `instagram-feed` (the section), `instagram-tile` (each), `instagram-viewer` (the dialog),
  `instagram-caption`, `instagram-link`, `instagram-video`, `instagram-close`,
  `instagram-album-slide`, `instagram-album-count`, `instagram-album-next`.
  The excerpt e2e walks the tabs and checks every paragraph and italic of every chapter.

## Conventions

- **Formatting:** Prettier defaults (`.prettierrc` is `{}`).
- **ESLint:** `no-unused-vars` allows identifiers matching `^[A-Z_]`.
- **File naming:** Components and pages are PascalCase `.jsx`. Hooks are camelCase `.js`
  starting with `use`. Static data modules are SCREAMING_SNAKE (`BOOK_DATA.jsx`).
- **Imports:** Relative paths only, no aliases.
- **Styling:** Tailwind utility classes inline, using the design tokens above. Reach for a
  `components/ui/` building block before writing a new one-off section style.

## Gotchas

- **All commands run from `client/`, not the repo root.**
- **`nodejs_compat` is required** on Cloudflare Pages for the Square SDK.
- **Keep the two Square implementations in sync** (route, response shape, `checkoutOptions`).
- **Env vars:** local dev reads `client/.env` / `.env.local`; production reads Cloudflare
  Pages env vars. Both accept `SQUARE_*` or `VITE_SQUARE_*`. The local `.env.local` may hold
  **production** credentials — never point tests or experiments at it.
- **Branch previews use Square sandbox keys** (Preview env vars in Cloudflare Pages), so
  checkout on a preview never creates real payment links. `client/scripts/sync-sandbox-catalog.mjs`
  mirrors the production catalog into sandbox (production is only read) and records the
  production → sandbox ID map in `client/scripts/sandbox-catalog-map.json`, so re-runs update
  rather than duplicate.
- **Favicon:** `client/public/favicon.svg` is `design/crystal-icon/favicon-wide.svg` (the
  owner's hand-edited gold crystal cluster from the Crownfall cover, on a `ground` tile);
  `favicon-32.png` and `apple-touch-icon.png` are rendered from it, never redrawn.
  `design/crystal-icon/crystal-icon-gold-wide.svg` is the tile-less version for use on pages.
- **SPA routing on Cloudflare** relies on `client/public/_redirects`.
- **Cover image:** pages use `crownfall_cover_web.jpg` (776×1200); `crownfall_cover.jpg` is
  the 10MB original — don't import it.
- **Cart persistence:** localStorage key `author-site-cart`.
- **`useSquare.getProducts()` caches the catalog in a `useRef`** for the hook's lifetime.
- **`console.log(response)` in `useSquare.js`** is leftover debug output.
- **Prices:** multiplied by 100 and cast to `BigInt` before sending to Square; non-numeric
  `item.price` throws.
- **`StrictMode` is on** — expect double-invoked effects in dev.
