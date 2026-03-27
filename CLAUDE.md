# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Author website for fantasy author Michael Vadney. React SPA with Square commerce integration, deployed on Cloudflare Pages.

## Commands

All commands run from the `client/` directory:

```bash
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build to dist/
npm run preview    # Preview production build at http://localhost:4173
npm run lint       # ESLint
```

There are no tests configured in this project.

## Architecture

### Monorepo Layout

- `client/` - The entire application lives here (package.json, vite config, source)
- `client/src/` - React source code
- `client/functions/` - Cloudflare Pages Functions (serverless API)
- `client/api/` - Vite dev server middleware (mirrors functions/ for local dev)

### Square API - Dual Implementation

The Square store integration has two parallel implementations that must stay in sync:

| Context | Location |
|---------|----------|
| Local dev (`vite dev`) | `client/api/squareApiPlugin.js` (Vite plugin middleware) |
| Production (Cloudflare Pages) | `client/functions/api/square/*.js` |

Both expose the same routes and response shapes:
- `GET /api/square/catalog` - Product listing
- `POST /api/square/checkout` - Create payment link
- `POST /api/square/customers` - Create customer

When modifying API behavior, update both implementations.

### State Management

- **Shopping cart**: Zustand store with localStorage persistence (`src/hooks/useCart.js`)
- **API data fetching**: TanStack React Query (`src/hooks/useSquare.js`)

### Styling

Tailwind CSS 4 with a brand color scheme defined in `src/theme.css`:
- Primary: white (#ffffff)
- Secondary: teal (#2b9994)
- Secondary dark: dark teal (#025e59)

### Environment Variables

Required in `.env` (or Cloudflare Pages dashboard for production):
- `SQUARE_ACCESS_TOKEN`
- `SQUARE_LOCATION_ID`
- `SQUARE_ENVIRONMENT` (sandbox or production)

### Deployment

Cloudflare Pages with automatic deploys from GitHub (`missingpiecetech/author-site`). Requires `nodejs_compat` compatibility flag for the Square SDK. Build root is `client/`.
