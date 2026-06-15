// ---------------------------------------------------------------------------
// Admin panel content. The admin reference is driven by the real endpoint
// catalog (groupsFor('gamru', 'admin')); this file only adds a per-group
// "what you manage here" note + an icon, so operators get context above each
// group of create / update / delete endpoints.
// ---------------------------------------------------------------------------

// Note + icon keyed by the endpoint `group` name in data/endpoints.js.
export const ADMIN_GROUP_META = {
  'Auth & Health': {
    icon: 'KeyRound',
    note: 'Operator console accounts. Register and log in operators, reset passwords. (Health is a public liveness probe.)',
  },
  Clients: {
    icon: 'Boxes',
    note: 'Onboard the platforms that consume Gamru. Creating a client returns the auth_key they set as GAMRU_CLIENT_AUTH_KEY. Rotate or disable a key at any time.',
  },
  Players: {
    icon: 'Users',
    note: 'Back-office player management — list, create, edit, grant manual rewards, and read a player’s campaign history and logs.',
  },
  Gamification: {
    icon: 'Sparkles',
    note: 'Author every gamification feature through one CRUD router (/gamification/:feature): missions, mission-bundles, ranks, xp & token rules, the reward-shop catalog, tournaments and player categories.',
    features: [
      'missions',
      'mission-bundles',
      'ranks',
      'xp-point-rules-casino',
      'xp-point-rules-sports',
      'token-rules-casino',
      'token-rules-sports',
      'reward-shop',
      'tournaments',
      'player-categories',
    ],
  },
  'Tournament Leaderboard': {
    icon: 'Trophy',
    note: 'Read the authoritative ranked standings for a tournament. (Players’ scores are submitted from the user side.)',
  },
  'CRM — Campaigns': {
    icon: 'Megaphone',
    note: 'Create, list and archive lifecycle marketing campaigns that bind a segment, a template and a trigger.',
  },
  'CRM — Segments': {
    icon: 'Filter',
    note: 'Define STATIC or DYNAMIC audiences from a rule tree, preview membership before saving, and list who currently matches.',
  },
  'CRM — Templates': {
    icon: 'Mail',
    note: 'Author per-channel message templates (EMAIL / SMS / ONSITE / WEBPUSH / INAPP).',
  },
  'CRM — Triggers': {
    icon: 'Zap',
    note: 'Define reusable triggers (a builder rule tree) that campaigns activate on.',
  },
  'CRM — Frequency Caps': {
    icon: 'Gauge',
    note: 'Limit how many messages a channel may send per period so players aren’t over-messaged.',
  },
  'CRM — Unsubscribe': {
    icon: 'BellOff',
    note: 'Record opt-outs with channel + reason; they suppress future sends.',
  },
  Analytics: {
    icon: 'BarChart3',
    note: 'Track delivery / open / click interactions and read aggregated campaign metrics.',
  },
  Catalogs: {
    icon: 'Database',
    note: 'Register casino games, providers and categories (sports catalogs share the same shape).',
  },
  Widgets: {
    icon: 'LayoutTemplate',
    note: 'Create, update and retire embeddable iframe widgets (Settings → Widget / iFrame Setup). Each config binds a client + widget type, controls access (status / expiry / allowed_domains) and carries the look-and-feel (appearance). The public /validate and /list routes serve the embeds.',
  },
  'System Settings': {
    icon: 'Settings',
    note: 'Bulk-upsert panel settings: core, gamification, mission, crm, platform and widgets.',
  },
  Media: {
    icon: 'Image',
    note: 'Upload banners, mission art and email assets (multipart/form-data).',
  },
}
