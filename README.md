# Jevin Thakar — Portfolio

**[Visit the portfolio](https://jevin042.github.io/jevin-thakar/)** · [LinkedIn](https://www.linkedin.com/in/jevin-thakar-628871135/) · [GitHub](https://github.com/jevin042)

A cinematic, responsive portfolio covering web/UI design, full-stack applications and conversational AI. Leads with Jinha and MarketTrade, then showcases Villa Aurelia, Midnight Listening Room, Aurum Evening and JA Studio. The previous portfolio remains available at [portfolio-3d](https://jevin042.github.io/portfolio-3d/).

## Development

```sh
npm ci
npm run dev
npm run typecheck
npm test
npm run build
npm run preview
```

React + TypeScript + Vite, Tailwind CSS v4, Lucide icons, and Radix Dialog for accessible case studies. No API keys or backend required. Content is in `src/data.ts`; styles are in `src/styles.css`.

## Component structure

The requested `components/ui/scroll-locked-video-hero.tsx` sits at the repository-root `/components/ui` path. `@` resolves to that root. `components.json` supplies shadcn aliases and Tailwind CSS configuration; `lib/utils.ts` provides `cn`. Reusable UI components go in this folder so shadcn additions and imports remain consistent. The component needs only React hooks and Lucide; no context provider or extra state manager is needed.

To add a shadcn component later: `npx shadcn@latest add button`. The React/TypeScript/Tailwind foundation is already installed; there is no additional setup required.

## Hero behavior

The train introduction uses native video playback, with a local 1280px H.264 asset, fast-start metadata and a lightweight poster. It plays once when visible, pauses offscreen or in a background tab, respects reduced motion, and has pause/replay controls. Wheel, touch and keyboard scrolling stay native; no body lock, per-frame seeking or continuous JavaScript animation loop. The existing component path and props remain compatible. `scrubDistance` is retained as a deprecated prop. Navigation and the visible Explore button remain available before media loads.

## Content & assets

- Professional history and education: the user's current [LinkedIn profile](https://www.linkedin.com/in/jevin-thakar-628871135/), verified October 6, 2026. Duplicate positions are consolidated in the portfolio.
- Project scope: the user's GitHub repositories and published interfaces. Jinha is an independent completed project, September 2026 (user-confirmed). Its live conversations remain invite-only. MarketTrade source remains private.
- Actual project screenshots are used for portfolio previews. MarketTrade uses a labelled illustrative visual, not a fabricated application screenshot.
- City video: [user-supplied 21st.dev CDN asset](https://cdn.21st.dev/assets/mirror/21/21a77eac28eacbb7e142016eefeaa0b4a766619e51113629a3bc6df6af066c0f.mp4). Credit for the reference concept: [Guglielmo Giannattasio](https://www.guglielmogiannattasio.it). Local train video and poster are optimized derivatives of that supplied asset. Third-party assets retain their own terms; no licence over those assets is asserted here.
- Public searches returned conflicting dates and unsupported years-of-experience claims; they are deliberately excluded. No private contacts, keys, provider identifiers or client source code are included.

## Deployment

GitHub Actions builds the site and deploys `dist` to GitHub Pages. Vite base is `/jevin-thakar/`. If the repository name changes, update the base, metadata and sitemap. To host at a domain root, use `/` instead. Case studies use an accessible modal, so direct-page routing is unnecessary.
