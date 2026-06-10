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
        section: 'Endpoint reference',
        platform: 'gamru',
        audience: 'user',
        links: [{ label: 'All user endpoints', to: '/user/endpoints' }],
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
        section: 'Endpoint reference',
        platform: 'gamru',
        audience: 'admin',
        links: [{ label: 'All admin endpoints', to: '/admin/endpoints' }],
      },
    ],
  },
}

// Resolve the active panel from the current path. Anything under /admin is the
// admin panel; everything else defaults to the user panel.
export const panelFor = (pathname) => (pathname.startsWith('/admin') ? PANELS.admin : PANELS.user)
