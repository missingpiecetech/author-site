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
the store's ebook line and About's "Invite Michael" list. **Use the tokens below; never
`primary`/`secondary`/`secondary-dark`, `bg-white` or `gray-*`.** (The old tokens remain in
`theme.css` only until every page is converted.)

### Colors (`src/theme.css`)

| Token          | Value     | Use                                                    |
| -------------- | --------- | ------------------------------------------------------ |
| `ground`       | `#121017` | Page background; text on gold                          |
| `band`         | `#17141d` | Alternate section bands (quotes, writing desk)         |
| `well`         | `#1c1922` | Inset panels, inputs, cart drawer, shipping notice     |
| `surface`      | `#25202c` | Image placeholders                                     |
| `rule`         | `#2c2733` | 1px section dividers and row separators                |
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
- **Sections** are separated by 1px `rule` lines, alternating `ground` and `band`; 80px side
  padding on desktop, 24px on mobile, content in a `max-w-7xl` column.
- **Buttons:** near-square (`rounded-btn`, 2px), heights 54/48/44. Primary = gold fill;
  secondary = transparent with an `outline` border; toggle pills use `aria-pressed` and the
  gold fill when pressed. Labels in sentence case.
- **Framed images:** covers and author photos sit in a 1px gold frame with a 14px inset
  (8px on mobile) and `shadow-cover`.
- **Pull quotes:** large italic Cormorant on a `band`, attribution in uppercase `subtle`.
- **Writing desk** (works in progress): title + status only — no progress percentages or bars.
- **Lists** (episodes, contact rows, links) are rows divided by `rule` lines, not cards.
- **Retailer links:** the Home Crownfall block and `/books` show `RetailerLinks` (Buy direct →
  `/store`, Buy on Amazon, Add it on Goodreads); the Store shows `ShippingNotice` (US-only,
  "via Amazon" linked) above all products; the footer links Goodreads. Retailer URLs live in
  `BOOK_DATA` (`retailers`).
- **Motion is kept, behind `prefers-reduced-motion`.** AOS, the keyframe classes in
  `index.css` (`animate-fade-in-up`, `animate-slide-in-*`, `animate-float*`, `delay-*`, …) and
  the floating circles (gold, 6–10% opacity) stay. Every keyframe and `opacity: 0` start state
  lives inside `@media (prefers-reduced-motion: no-preference)`; AOS is initialised with
  `disable: () => matchMedia("(prefers-reduced-motion: reduce)").matches`; Tailwind animations
  use `motion-safe:`; no parallax under reduced motion. The e2e fails if any content is left
  at opacity 0 with reduced motion on.
- Sections with horizontal entrance animations use `<Section clipX>` (`overflow-x-clip`).
- Every layout must work at 390px with no horizontal scroll.
- About will get an Instagram feed (separate work); there is no appearances list.

### Building blocks

- `src/components/ui/`: `Section` (`band`, `ruled`, `clipX`, `spacing`), `Eyebrow`, `Button`
  (`variant` primary/secondary/pill, `size` lg/md/sm, `to`/`href`, `pressed`, `block`),
  `FramedImage` (`aspect`, `placeholder`), `PullQuote` (`quote`, `name`, `credit`),
  `RuleList`/`RuleRow` (`to`/`href`, `arrow`), `PageIntro` (`eyebrow`, `title`, `accent`,
  `lede`).
- `src/components/`: `RetailerLinks` (`compact`), `ShippingNotice`, `JoinCircleButton`
  (opens the MailerLite popup), plus the restyled `Navigation`, `Footer`, `NewsLetter`,
  `Socials`, `ShoppingCart`.
- `src/hooks/useHashScroll.js`: call it on pages with `#section` links (`/#crownfall`,
  `/books#<slug>`); the header skips scroll-to-top when the URL has a hash.
- `src/SITE_INFO.js`: name, tagline, location, emails, press kit, newsletter form id and
  `shipping.usOnly` (the switch that shows `ShippingNotice`).

## Repo Layout

Everything lives under `client/`. The repo root only has the README, DEPLOYMENT.md, `.nvmrc`
and `.gitignore`.

```
author-site/
├── .nvmrc                    # Node 20
├── README.md
├── DEPLOYMENT.md             # Cloudflare Pages setup walkthrough
└── client/                   # All app code lives here — run npm commands from this dir
    ├── index.html            # SPA shell; loads MailerLite snippet
    ├── vite.config.js        # Registers createSquareApiPlugin for local /api/square
    ├── wrangler.toml         # Cloudflare Pages config (nodejs_compat)
    ├── .env.example          # SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, SQUARE_ENVIRONMENT
    ├── public/
    │   └── _redirects        # "/* /index.html 200" — SPA routing on Cloudflare
    ├── api/
    │   └── squareApiPlugin.js    # Vite dev-server middleware for /api/square/*
    ├── functions/
    │   └── api/square/           # Cloudflare Pages Functions (prod /api/square/*)
    │       ├── catalog.js        # GET  /api/square/catalog
    │       ├── checkout.js       # POST /api/square/checkout
    │       └── customers.js      # POST /api/square/customers
    └── src/
        ├── main.jsx
        ├── App.jsx               # Router + QueryClientProvider + Layout
        ├── index.css, theme.css
        ├── BOOK_DATA.jsx         # Static book metadata (slug, praise, retailers)
        ├── SOCIAL_LINKS.jsx      # Static social link data
        ├── SITE_INFO.js          # Site constants (emails, press kit, shipping switch)
        ├── assets/               # Author photos, book covers, podcast logos
        ├── components/           # Layout, Navigation, Footer, ShoppingCart, ...
        │   └── ui/               # Section, Eyebrow, Button, FramedImage, PullQuote, ...
        ├── pages/                # One file per route: / /books /podcast /about /store
        │                         #   /contact /checkout/success
        └── hooks/
            ├── useCart.js         # Zustand cart store (persisted)
            ├── useHashScroll.js   # Scroll to location.hash after render
            └── useSquare.js       # Fetches /api/square/* + maps catalog → products
```

## NPM Scripts

Run from `client/`.

| Command             | Purpose                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------- |
| `npm run dev`       | Vite dev server (default http://localhost:5173)                                           |
| `npm run build`     | Production build to `client/dist/`                                                        |
| `npm test`          | Unit, then e2e                                                                            |
| `npm run test:unit` | Vitest: both checkout implementations, Square SDK mocked                                  |
| `npm run test:e2e`  | Puppeteer: /store → cart → checkout, desktop + 390px, no horizontal scroll on every route |
| `npm run preview`   | Serve the production build locally                                                        |
| `npm run lint`      | ESLint                                                                                    |

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
- **E2E** (`tests/e2e/`): starts the real `vite` CLI on a free port with the `square` package
  swapped for an in-process stub (`support/register-square-stub.mjs`) — nothing reaches
  Square, and inherited `SQUARE_*` env vars are stripped. Drives /store → cart → checkout for
  a featured "Crownfall" product and a grid product at desktop and 390px, and checks every
  route for horizontal scroll (`/` and `/contact` are `it.fails` until #7 is fixed) and, with
  `prefers-reduced-motion: reduce`, for content left at opacity 0.
- **The e2e selects only by `data-testid`.** Restyle freely, but keep these hooks:
  `store-product` (+ `data-product-id`), `add-to-cart`, `qty-increase`, `qty-decrease`,
  `qty-value`, `cart-toggle`, `cart-count`, `cart-panel` (+ `data-state`), `cart-close`,
  `cart-item`, `cart-subtotal`, `checkout-button`, `checkout-error`, `mobile-menu-toggle`,
  `mobile-cart-button`.

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
- **SPA routing on Cloudflare** relies on `client/public/_redirects`.
- **Cover image:** pages use `crownfall_cover_web.jpg` (776×1200); `crownfall_cover.jpg` is
  the 10MB original — don't import it.
- **Cart persistence:** localStorage key `author-site-cart`.
- **`useSquare.getProducts()` caches the catalog in a `useRef`** for the hook's lifetime.
- **`console.log(response)` in `useSquare.js`** is leftover debug output.
- **Prices:** multiplied by 100 and cast to `BigInt` before sending to Square; non-numeric
  `item.price` throws.
- **`StrictMode` is on** — expect double-invoked effects in dev.
