# SnugWeek

A cozy weekly planner-journal. A notebook-style week spread with a task column per day, sidebar backlog lists, drag-and-drop planning, day trackers (mood / energy / custom), a habit grid, a week note, page-turn week navigation, a month overview, and monthly / yearly stats — wrapped in several warm color themes. Offline-first with automatic background sync, anonymous-first accounts you can link later. Default UI language is Ukrainian (English included).

Installable as a PWA on desktop, Android, and iOS; works fully offline once loaded.

## Tech stack

- **Build:** Vite + TypeScript
- **UI:** React + Mantine (`@mantine/core`, `@mantine/dates`, `@mantine/notifications`, `@mantine/charts`)
- **State:** Zustand
- **Backend:** Firebase — Firestore with offline persistence + Auth (anonymous-first)
- **Drag & drop:** dnd-kit
- **Animation:** Motion
- **Routing:** React Router
- **i18n:** i18next + react-i18next (en source, uk default)
- **PWA:** vite-plugin-pwa (Workbox)

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in your Firebase web config
npm run dev
```

Create a Firebase project, enable **Authentication** (Anonymous + the providers you want) and **Cloud Firestore**, and copy the web app config values into `.env.local`. The Firestore security rules live in `firestore.rules`.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build locally (needed to exercise the service worker)
- `npm run lint` — run ESLint
- `npm run format` — format `src` with Prettier
- `npm run gen:assets` — regenerate app icons, favicon, and the social preview image from the SVG sources in `scripts/assets/`

## Deployment

The app is a static SPA. Deploy `dist/` to any static host; configure a catch-all rewrite to `index.html` so client-side routes resolve (see `vercel.json`). Set the `VITE_FIREBASE_*` environment variables in the host, and add the production domain to Firebase **Authentication → Authorized domains**.

## License

See [LICENSE](LICENSE).
