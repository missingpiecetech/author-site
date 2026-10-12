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

The site is moving from the old white/teal look to a dark, bookish design (gold on near-black,
classic serif type). The source design is the "Fantasy Author Website Concepts" canvas
(Home, Store, Podcast, About boards, plus a mobile Home board). Pages are being converted one
at a time on the `redesign/dark` integration branch; until that merges, `main` still renders
the old look. **All new UI work uses the tokens below — never the old ones.**

### Colors (`src/theme.css`)

| Token          | Value     | Use                                                                   |
| -------------- | --------- | --------------------------------------------------------------------- |
| `ground`       | `#121017` | Page background                                                       |
| `band`         | `#17141d` | Alternate section bands (quotes, writing desk)                        |
| `well`         | `#1c1922` | Inset panels, inputs, audio player                                    |
| `surface`      | `#25202c` | Image placeholders                                                    |
| `rule`         | `#2c2733` | 1px section dividers and borders                                      |
| `edge`         | `#3a3342` | Card / placeholder borders                                            |
| `outline`      | `#4a4353` | Secondary (outlined) button border                                    |
| `cream`        | `#ece4d4` | Primary text and headings                                             |
| `muted`        | `#c9c0ae` | Body copy, ledes                                                      |
| `subtle`       | `#b3a996` | Captions, attributions, footer text                                   |
| `accent`       | `#cfae6b` | Antique gold: eyebrows, primary buttons, links, frames, progress bars |
| `accent-hover` | `#e6c98c` | Link/button hover                                                     |

Primary buttons are gold fill with `ground`-colored text. Text on gold is always dark.

### Typography

- **Display:** Cormorant Garamond (500/600/700, italic 500) — headings, the site name, hooks
  and pull quotes (italic).
- **Body:** Spectral (400/500, italic 400) — everything else.
- Self-hosted via `@fontsource/*` imports in `main.jsx` (no Google Fonts link).
- Fluid type tokens (`text-display`, `text-title`, `text-heading`, `text-hook`, `text-quote`,
  `text-reading`, `text-lede`, `text-eyebrow`) scale between the 390px and 1440px mockup sizes.

### Patterns

- **Eyebrow:** small uppercase gold label with `0.22em` tracking above every section heading.
- **Sections** are separated by 1px `rule` lines, alternating `ground` and `band` backgrounds;
  80px side padding on desktop, 24px on mobile.
- **Buttons:** near-square (`2px` radius). Primary = gold fill; secondary = transparent with an
  `outline` border; toggle pills use `aria-pressed`.
- **Framed images:** book covers and the author photo sit in a 1px gold frame with a 14px
  inset and a deep drop shadow.
- **Pull quotes:** large italic Cormorant on a `band`, attribution in uppercase `subtle` text.
- **Progress rows** ("From the Writing Desk"): title + stage/percent, 10px rounded gold bar on
  a `rule` track.
- **Lists** (episodes, appearances, contact rows) are rows divided by `rule` lines, not cards.
- No scroll animations, floating shapes or parallax — the old AOS/keyframe effects are retired.
- Shared building blocks live in `src/components/ui/` (`Section`, `Eyebrow`, `Button`,
  `FramedImage`, `PullQuote`, `RuleList`, `ProgressRow`, `PageIntro`).
- Every layout must work at 390px with no horizontal scroll.

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
        ├── BOOK_DATA.jsx         # Static book metadata
        ├── SOCIAL_LINKS.jsx      # Static social link data
        ├── assets/               # Author photos, book covers, podcast logos
        ├── components/           # Layout, Navigation, Footer, ShoppingCart, ...
        ├── pages/                # One file per route: / /books /podcast /about /store
        │                         #   /contact /checkout/success
        └── hooks/
            ├── useCart.js         # Zustand cart store (persisted)
            └── useSquare.js       # Fetches /api/square/* + maps catalog → products
```

## NPM Scripts

Run from `client/`.

| Command           | Purpose                                         |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Vite dev server (default http://localhost:5173) |
| `npm run build`   | Production build to `client/dist/`              |
| `npm run preview` | Serve the production build locally              |
| `npm run lint`    | ESLint                                          |

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
- **SPA routing on Cloudflare** relies on `client/public/_redirects`.
- **Cart persistence:** localStorage key `author-site-cart`.
- **`useSquare.getProducts()` caches the catalog in a `useRef`** for the hook's lifetime.
- **`console.log(response)` in `useSquare.js`** is leftover debug output.
- **Prices:** multiplied by 100 and cast to `BigInt` before sending to Square; non-numeric
  `item.price` throws.
- **`StrictMode` is on** — expect double-invoked effects in dev.
