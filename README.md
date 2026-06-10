# Gamru Docs

A static developer-documentation portal for the **Gamru gamification engine**
(`gamru-backend`) and its integration with the **games platform**
(`my-game-platform-backend`) — built in the style of the Gamanza Engage docs.

It explains, in plain English:

- **Architecture** — the engine + client split and the three ways they talk.
- **Auth & security** — JWT, ADMIN, client key and the double-locked event endpoint.
- **Integration guide** — five steps to wire a games platform to gamru.
- **Core flows** — onboarding, XP/leveling, deposits, missions, bundles,
  tournaments, rewards, reward shop and CRM campaigns — each with numbered
  steps, a call sequence and guarantees.
- **API reference** — every endpoint for both platforms with method, path, auth,
  request/response shapes and copy-paste examples (the "Open API spec" panel).

## Stack

React 18 · Vite 5 · Tailwind CSS 3 · react-router 6 (HashRouter) · lucide-react.
No backend — it's a fully static site.

## Run it

```bash
cd gamru-docs
npm install
npm run dev      # http://localhost:5174
```

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # serve the production build
```

`base` is `./` and routing uses `HashRouter`, so the built `dist/` works from any
sub-path or static host (and even when opened directly).

## Where the content lives

All content is data-driven — edit these and the pages update automatically:

| File | What |
|---|---|
| `src/data/endpoints.js` | Every endpoint (both platforms), grouped. |
| `src/data/flows.js` | The end-to-end flows (steps, sequences, notes). |
| `src/data/nav.js` | Sidebar + top-nav structure. |

Pages render that data: `src/pages/*` and `src/components/*`.
