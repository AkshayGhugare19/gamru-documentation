// ---------------------------------------------------------------------------
// The portal is split into TWO panels — pick your side at the top of every page:
//
//   USER  — you integrate Gamru and let your players USE it: register, then see
//           progress / level / rank / XP, do missions & bundles, join
//           tournaments, claim rewards, spend tokens. Client-key endpoints only.
//
//   ADMIN — you operate Gamru: CREATE / UPDATE / DELETE missions, mission
//           bundles, ranks, rules, the reward shop, tournaments, templates,
//           segments, campaigns, clients and settings. Operator (JWT) endpoints.
//
// Each panel owns its own home, top links, sidebar nav and endpoint reference.
// ---------------------------------------------------------------------------

import { PAGE_WIDGETS, INLINE_WIDGETS } from './widgets'

// One sidebar link per widget type → its own detail page (UI + code).
const widgetLinks = (list) => list.map((w) => ({ label: w.label, to: `/user/widgets/${w.type}` }))

export const PANELS = {
  user: {
    key: 'user',
    label: 'User',
    tagline: 'Use Gamru in your platform',
    home: '/user',
    accent: 'brand',
    top: [
      { label: 'Overview', to: '/user' },
      { label: 'Integrate', to: '/user/integrate' },
      { label: 'API', to: '/user/api' },
    ],
    nav: [
      {
        section: 'Use Gamru',
        links: [
          { label: 'Overview', to: '/user' },
          { label: 'Integrate your platform', to: '/user/integrate' },
          { label: 'API — what you call', to: '/user/api' },
        ],
      },
      {
        section: 'Missions & Tournaments',
        links: [{ label: 'How to use them', to: '/user/missions-tournaments' }],
      },
      {
        section: 'Campaigns & Inbox',
        links: [{ label: 'Deliver & render messages', to: '/user/campaigns' }],
      },
      {
        section: 'Widgets',
        links: [{ label: 'Overview & setup', to: '/user/widgets' }, ...widgetLinks(PAGE_WIDGETS)],
      },
      {
        section: 'Widgets — Gamification data',
        links: widgetLinks(INLINE_WIDGETS),
      },
      {
        section: 'Endpoint reference',
        platform: 'gamru',
        audience: 'user',
        links: [{ label: 'All user endpoints', to: '/user/endpoints' }],
      },
      {
        section: 'Testing box',
        links: [{ label: 'Try user endpoints', to: '/user/testing' }],
      },
    ],
  },

  admin: {
    key: 'admin',
    label: 'Admin',
    tagline: 'Manage everything in Gamru',
    home: '/admin',
    accent: 'rose',
    top: [
      { label: 'Overview', to: '/admin' },
      { label: 'Manage', to: '/admin/api' },
    ],
    nav: [
      {
        section: 'Manage Gamru',
        links: [
          { label: 'Overview', to: '/admin' },
          { label: 'Manage by resource', to: '/admin/api' },
        ],
      },
      {
        section: 'Missions & Tournaments',
        links: [{ label: 'Create, update, get, delete', to: '/admin/missions-tournaments' }],
      },
      {
        section: 'Campaigns',
        links: [{ label: 'Author, send & trigger', to: '/admin/campaigns' }],
      },
      {
        section: 'Widgets',
        links: [{ label: 'Create & manage widgets', to: '/admin/widgets' }],
      },
      {
        section: 'Endpoint reference',
        platform: 'gamru',
        audience: 'admin',
        links: [{ label: 'All admin endpoints', to: '/admin/endpoints' }],
      },
      {
        section: 'Testing box',
        links: [{ label: 'Try admin endpoints', to: '/admin/testing' }],
      },
    ],
  },
}

// Resolve the active panel from the current path. Anything under /admin is the
// admin panel; everything else defaults to the user panel.
export const panelFor = (pathname) => (pathname.startsWith('/admin') ? PANELS.admin : PANELS.user)
