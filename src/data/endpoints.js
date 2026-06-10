// ---------------------------------------------------------------------------
// Endpoint catalog — extracted from the real backends.
//   platform: 'gamru'  -> gamru-backend (the gamification engine + operator API)
//   platform: 'games'  -> my-game-platform-backend (the casino / player app)
//
// Each endpoint: { id, platform, group, method, path, title, summary, auth,
//   params?, query?, body?, response? }
//   body/response.fields use { name, type, required, desc }
//   response.example is a JSON string shown in the right-hand panel.
// ---------------------------------------------------------------------------

export const AUTH = {
  none: { key: 'none', label: 'Public', color: 'slate', hint: 'no auth' },
  jwt: { key: 'jwt', label: 'JWT (operator)', color: 'emerald', hint: 'operator console token' },
  admin: { key: 'admin', label: 'JWT + ADMIN', color: 'rose', hint: 'operator with ADMIN role' },
  client: { key: 'client', label: 'Client key (S2S)', color: 'amber', hint: 'x-client-auth-key header' },
  flex: { key: 'flex', label: 'JWT or Client key', color: 'violet', hint: 'operator or service' },
  player: { key: 'player', label: 'Player JWT', color: 'sky', hint: 'player access token' },
}

const j = (o) => JSON.stringify(o, null, 2)

// ===========================================================================
// GAMRU ENGINE — operator console + rules engine + service-to-service API
// ===========================================================================
const gamru = [
  // ---- Auth ----
  {
    id: 'gamru-health',
    platform: 'gamru', group: 'Auth & Health', method: 'GET', path: '/api/health',
    title: 'Health check', auth: 'none',
    summary: 'Liveness probe. Use it to confirm the engine is reachable before sending traffic.',
    response: { status: 200, example: j({ success: true, message: 'Server is running' }) },
  },
  {
    id: 'gamru-register',
    platform: 'gamru', group: 'Auth & Health', method: 'POST', path: '/api/auth/register',
    title: 'Register operator', auth: 'none',
    summary: 'Create a back-office (operator) account for the gamru admin console.',
    body: { fields: [
      { name: 'first_name', type: 'string', required: true, desc: '2–100 chars' },
      { name: 'last_name', type: 'string', required: true, desc: '2–100 chars' },
      { name: 'email', type: 'string', required: true, desc: 'valid email' },
      { name: 'password', type: 'string', required: true, desc: '6–100 chars' },
      { name: 'mobile', type: 'string', required: true, desc: '10–15 digits' },
    ]},
    response: { status: 201, example: j({ success: true, message: 'User registered successfully', data: { id: 'uuid', email: 'op@brand.com', role: 'ADMIN' } }) },
  },
  {
    id: 'gamru-login',
    platform: 'gamru', group: 'Auth & Health', method: 'POST', path: '/api/auth/login',
    title: 'Operator login', auth: 'none',
    summary: 'Authenticate an operator and receive the JWT used for every admin-console call.',
    body: { fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'password', type: 'string', required: true },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Login successful', data: { token: 'eyJhbGci...', user: { id: 'uuid', email: 'op@brand.com', role: 'ADMIN' } } }) },
  },
  {
    id: 'gamru-reset-password',
    platform: 'gamru', group: 'Auth & Health', method: 'POST', path: '/api/auth/reset-password',
    title: 'Reset password', auth: 'none',
    summary: 'Reset an operator password using an emailed token (or directly in dev).',
    body: { fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'token', type: 'string', required: false, desc: 'reset token' },
      { name: 'new_password', type: 'string', required: true, desc: '6–100 chars' },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Password reset successful', data: { email: 'op@brand.com' } }) },
  },

  // ---- Clients (THE integration on-ramp) ----
  {
    id: 'gamru-clients-me',
    platform: 'gamru', group: 'Clients', method: 'GET', path: '/api/clients/me',
    title: 'Identify current client', auth: 'client',
    summary: 'A service backend calls this at boot to verify its client key is valid and the client is ENABLED. The games platform runs it on startup (verifyGamruClient).',
    response: { status: 200, example: j({ success: true, message: 'Client identified', data: { id: 'uuid', name: 'Lucky Casino', slug: 'lucky-casino', skin_id: 'lc', status: 'ENABLED' } }) },
  },
  {
    id: 'gamru-clients-add',
    platform: 'gamru', group: 'Clients', method: 'POST', path: '/api/clients/add',
    title: 'Register a client', auth: 'admin',
    summary: 'Create an external client (a casino / skin). The response contains the generated auth_key — copy it into the platform’s GAMRU_CLIENT_AUTH_KEY.',
    body: { fields: [
      { name: 'name', type: 'string', required: true, desc: '2–120 chars' },
      { name: 'slug', type: 'string', required: false, desc: 'auto from name' },
      { name: 'skin_id', type: 'string', required: false },
      { name: 'webhook_url', type: 'string', required: false, desc: 'valid URI' },
      { name: 'status', type: "'ENABLED' | 'DISABLED'", required: false, desc: 'default ENABLED' },
      { name: 'meta', type: 'object', required: false },
    ]},
    response: { status: 201, example: j({ success: true, data: { id: 'uuid', name: 'Lucky Casino', slug: 'lucky-casino', auth_key: 'ck_live_9f2c...', status: 'ENABLED' } }) },
  },
  {
    id: 'gamru-clients-paginate',
    platform: 'gamru', group: 'Clients', method: 'GET', path: '/api/clients/paginate',
    title: 'List clients', auth: 'admin',
    summary: 'Paginated list of registered clients with status filter.',
    query: { fields: [
      { name: 'page', type: 'number', desc: 'default 1' },
      { name: 'limit', type: 'number', desc: 'default 10' },
      { name: 'search', type: 'string' },
      { name: 'status', type: "'ENABLED' | 'DISABLED'" },
    ]},
    response: { status: 200, example: j({ success: true, data: [{ id: 'uuid', name: 'Lucky Casino', status: 'ENABLED' }], total: 1, page: 1, limit: 10 }) },
  },
  {
    id: 'gamru-clients-rotate',
    platform: 'gamru', group: 'Clients', method: 'POST', path: '/api/clients/rotate-auth-key/:id',
    title: 'Rotate client auth key', auth: 'admin',
    summary: 'Issue a new auth_key and invalidate the old one. Update the platform env immediately after rotating.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, data: { id: 'uuid', auth_key: 'ck_live_NEW...' } }) },
  },
  {
    id: 'gamru-clients-toggle',
    platform: 'gamru', group: 'Clients', method: 'POST', path: '/api/clients/toggle-status/:id',
    title: 'Enable / disable client', auth: 'admin',
    summary: 'Flip a client between ENABLED and DISABLED. A DISABLED client receives 403 on every S2S call.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, data: { id: 'uuid', status: 'DISABLED' } }) },
  },

  // ---- Users (the registration on-ramp your platform calls) ----
  {
    id: 'gamru-users-add',
    platform: 'gamru', group: 'Users & registration', method: 'POST', path: '/api/users/add',
    title: 'Register a user (+ player)', auth: 'client',
    summary: 'The call your platform makes on signup. Creates the gamru user AND the matching player in a single call (addUserService → createPlayerService). The route is public, but send your x-client-auth-key so gamru tags the account source=EXTERNAL to your client. This is what createGamruUser() wraps.',
    headers: [
      { name: 'x-client-auth-key', desc: 'your client key — marks the account EXTERNAL to your client' },
    ],
    body: { fields: [
      { name: 'first_name', type: 'string', required: true, desc: '2–100 chars' },
      { name: 'last_name', type: 'string', required: true, desc: '2–100 chars' },
      { name: 'email', type: 'string', required: true, desc: 'valid email' },
      { name: 'mobile', type: 'string', required: true, desc: '10–15 digits' },
      { name: 'password', type: 'string', required: false, desc: '6–100 chars' },
      { name: 'username', type: 'string', required: false, desc: '3–100 chars (else derive from email)' },
      { name: 'role', type: "'USER' | 'ADMIN'", required: false, desc: 'default USER' },
      { name: 'status', type: "'ACTIVE' | 'INACTIVE'", required: false, desc: 'default ACTIVE' },
      { name: 'source', type: 'string', required: false, desc: 'your platform name, e.g. GAMIFY' },
    ]},
    response: { status: 201, example: j({ success: true, message: 'User added successfully', data: { id: 'uuid', email: 'jane@x.com', player_id: 'P-1001' } }) },
  },

  // ---- Integration (optional lifecycle event hook) ----
  {
    id: 'gamru-integration-events',
    platform: 'gamru', group: 'Integration', method: 'POST', path: '/api/integration/events',
    title: 'Push a lifecycle event', auth: 'client',
    summary: 'Optional one-way hook to notify gamru of player lifecycle facts. Idempotent on event_id, fire-and-forget. This is what syncToGamru() wraps. Requires BOTH the shared service key and your client key.',
    headers: [
      { name: 'x-service-key', desc: 'shared service secret — required (serviceAuth)' },
      { name: 'x-client-auth-key', desc: 'your client key — required (clientAuth)' },
    ],
    body: { fields: [
      { name: 'event_id', type: 'string', required: true, desc: 'unique & stable (1–180 chars) — dedupe key' },
      { name: 'event_type', type: 'enum', required: true, desc: 'USER_REGISTERED | XP_AWARDED | LEVEL_UP | RANK_UP | DEPOSIT_MADE' },
      { name: 'external_id', type: 'string', required: true, desc: 'your platform’s user id (1–120 chars)' },
      { name: 'origin', type: 'string', required: false, desc: 'your platform name (≤40 chars)' },
      { name: 'email', type: 'string|null', required: false, desc: 'links USER_REGISTERED → player' },
      { name: 'amount', type: 'number', required: false, desc: 'XP delta / deposit amount' },
      { name: 'meta', type: 'object', required: false, desc: 'free-form context' },
    ]},
    bodyExample: {
      event_id: 'DEPOSIT_MADE:P-1001:dep-5521',
      event_type: 'DEPOSIT_MADE',
      external_id: 'P-1001',
      origin: 'gamify',
      email: 'jane@x.com',
      amount: 100,
      meta: { deposit_count: 3 },
    },
    response: { status: 200, example: j({ success: true, message: 'Event processed', data: { applied: true, duplicate: false } }) },
  },

  // ---- Players (read/write + S2S claim surface) ----
  {
    id: 'gamru-players-by-email',
    platform: 'gamru', group: 'Players', method: 'POST', path: '/api/players/by-email',
    title: 'Get player by email', auth: 'client',
    summary: 'S2S lookup that returns the player plus the whole gamification snapshot (progress, missions, bundles, tournaments, reward_shop, rewards, logs). This is the call the games platform makes to render almost every gamified screen.',
    body: { fields: [{ name: 'email', type: 'string', required: true }] },
    response: { status: 200, example: j({ success: true, data: { id: 'uuid', name: 'Jane', level: 7, xp_points: 1240, rank_name: 'Silver', tokens: 320, gamification: { progress: {}, missions: [], mission_bundles: [], tournaments: [], reward_shop: [], rewards: [], logs: [] } } }) },
  },
  {
    id: 'gamru-players-add-xp',
    platform: 'gamru', group: 'Players', method: 'POST', path: '/api/players/by-email/add-xp',
    title: 'Add XP by email', auth: 'client',
    summary: 'Award XP to a player identified by email. The optional game block feeds the player’s casino personalization (favourite category/provider). The engine recomputes level & rank from the ladder.',
    body: { fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'amount', type: 'number', required: true, desc: 'may be 0 if game provided' },
      { name: 'game', type: 'object', required: false, desc: '{ id, name, category, provider, turnover }' },
    ]},
    response: { status: 200, example: j({ success: true, data: { id: 'uuid', xp_points: 1290, level: 7, rank_name: 'Silver', xp_to_next: 210 } }) },
  },
  {
    id: 'gamru-players-paginate',
    platform: 'gamru', group: 'Players', method: 'GET', path: '/api/players/paginate',
    title: 'List players', auth: 'jwt',
    summary: 'Back-office player grid with search across name / email / username / player_id.',
    query: { fields: [
      { name: 'page', type: 'number', desc: 'default 1' },
      { name: 'limit', type: 'number', desc: 'default 25' },
      { name: 'search', type: 'string' },
      { name: 'status', type: 'string' },
      { name: 'country', type: 'string' },
      { name: 'field', type: "'all'|'name'|'email'|'username'|'player_id'" },
    ]},
    response: { status: 200, example: j({ success: true, data: [{ id: 'uuid', player_id: 'P-1001', name: 'Jane', level: 7 }], total: 1 }) },
  },
  {
    id: 'gamru-players-get',
    platform: 'gamru', group: 'Players', method: 'GET', path: '/api/players/:id',
    title: 'Get player', auth: 'flex',
    summary: 'Fetch a single player. Operators use JWT; service backends may use the client key.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, data: { id: 'uuid', name: 'Jane', level: 7, xp_points: 1240, rank_name: 'Silver' } }) },
  },
  {
    id: 'gamru-players-add',
    platform: 'gamru', group: 'Players', method: 'POST', path: '/api/players/add',
    title: 'Create player', auth: 'jwt',
    summary: 'Create a player profile. Most fields are optional; player_id and username are required.',
    body: { fields: [
      { name: 'player_id', type: 'string', required: true },
      { name: 'username', type: 'string', required: true },
      { name: 'email', type: 'string', required: false },
      { name: 'status', type: "'ACTIVE'|'INACTIVE'|'BLOCKED'|'N/A'", required: false },
      { name: 'country / city / language', type: 'string', required: false },
      { name: 'level / xp_points / tokens', type: 'number', required: false },
      { name: 'consents / personalization / custom_data', type: 'object', required: false },
    ]},
    response: { status: 201, example: j({ success: true, data: { id: 'uuid', player_id: 'P-1001', username: 'jane' } }) },
  },
  {
    id: 'gamru-players-rewards',
    platform: 'gamru', group: 'Players', method: 'GET', path: '/api/players/:id/rewards',
    title: 'List player rewards', auth: 'jwt',
    summary: 'All rewards for a player with their status (IN_PROGRESS, GRANTED, CLAIMED, EXPIRED).',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, data: [{ id: 'uuid', reward_type: 'BONUS_CASH', reward: '10.00', status: 'IN_PROGRESS' }] }) },
  },
  {
    id: 'gamru-players-reward-claim',
    platform: 'gamru', group: 'Players', method: 'POST', path: '/api/players/:id/rewards/:rewardId/claim',
    title: 'Claim a reward', auth: 'client',
    summary: 'S2S — the games platform calls this when a player taps “claim”. gamru is the reward ledger of record.',
    params: { fields: [
      { name: 'id', type: 'uuid', required: true, desc: 'player id' },
      { name: 'rewardId', type: 'uuid', required: true },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Reward claimed', data: { id: 'uuid', status: 'CLAIMED' } }) },
  },
  {
    id: 'gamru-players-mission-claim',
    platform: 'gamru', group: 'Players', method: 'POST', path: '/api/players/:id/missions/:missionId/claim',
    title: 'Claim mission reward', auth: 'client',
    summary: 'S2S — grant the reward defined on a completed mission and flip the mission to CLAIMED.',
    params: { fields: [
      { name: 'id', type: 'uuid', required: true, desc: 'player id' },
      { name: 'missionId', type: 'uuid', required: true },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Mission reward granted', data: { reward_type: 'XP', reward: '50' } }) },
  },
  {
    id: 'gamru-players-shop-purchase',
    platform: 'gamru', group: 'Players', method: 'POST', path: '/api/players/:id/reward-shop/purchase',
    title: 'Purchase shop item', auth: 'client',
    summary: 'S2S — spend tokens on a reward-shop item. Atomic: token deduction, stock decrement and audit all commit together.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    body: { fields: [
      { name: 'shop_item_id', type: 'uuid', required: true },
      { name: 'quantity', type: 'number', required: false, desc: '1–99, default 1' },
    ]},
    response: { status: 200, example: j({ success: true, data: { tokens_remaining: 220, tokens_spent: 100 } }) },
  },
  {
    id: 'gamru-players-campaign-history',
    platform: 'gamru', group: 'Players', method: 'GET', path: '/api/players/:id/campaign-history',
    title: 'Player campaign history', auth: 'jwt',
    summary: 'Every campaign message the player has received.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, data: [{ campaign: 'Welcome', channel: 'EMAIL', status: 'DELIVERED' }] }) },
  },

  // ---- Gamification (dynamic feature router) ----
  {
    id: 'gamru-gam-paginate',
    platform: 'gamru', group: 'Gamification', method: 'GET', path: '/api/gamification/:feature/paginate',
    title: 'List gamification items', auth: 'jwt',
    summary: 'One router serves every feature. :feature ∈ missions, mission-bundles, ranks, token-rules-casino, token-rules-sports, xp-point-rules-casino, xp-point-rules-sports, player-categories, reward-shop, prizeshark-catalog, purchase-feed, tournaments.',
    params: { fields: [{ name: 'feature', type: 'string', required: true, desc: 'feature key (see summary)' }] },
    query: { fields: [
      { name: 'page / limit', type: 'number' },
      { name: 'search', type: 'string' },
      { name: 'status', type: "'ACTIVE'|'INACTIVE'" },
      { name: 'archived', type: 'boolean' },
      { name: 'tag', type: 'string' },
    ]},
    response: { status: 200, example: j({ success: true, data: [{ id: 'uuid', name: 'Daily Spinner', status: 'ACTIVE', data: {} }], total: 1 }) },
  },
  {
    id: 'gamru-gam-add',
    platform: 'gamru', group: 'Gamification', method: 'POST', path: '/api/gamification/:feature/add',
    title: 'Create gamification item', auth: 'jwt',
    summary: 'Create a mission, bundle, rank, rule, tournament, etc. Feature-specific config lives in the data JSONB blob (e.g. a mission’s objectives, a rank’s level ladder).',
    params: { fields: [{ name: 'feature', type: 'string', required: true }] },
    body: { fields: [
      { name: 'name', type: 'string', required: true, desc: '1–200 chars' },
      { name: 'status', type: "'ACTIVE'|'INACTIVE'", required: false },
      { name: 'priority', type: 'number', required: false },
      { name: 'tags', type: 'string[]', required: false },
      { name: 'data', type: 'object', required: false, desc: 'feature-specific (objectives / levels / reward)' },
    ]},
    response: { status: 201, example: j({ success: true, data: { id: 'uuid', name: 'Daily Spinner', status: 'ACTIVE' } }) },
  },
  {
    id: 'gamru-gam-update',
    platform: 'gamru', group: 'Gamification', method: 'POST', path: '/api/gamification/:feature/update-by/:id',
    title: 'Update gamification item', auth: 'jwt',
    summary: 'Edit any item. Rank updates are validated for ladder continuity (no XP gaps/overlaps).',
    params: { fields: [
      { name: 'feature', type: 'string', required: true },
      { name: 'id', type: 'uuid', required: true },
    ]},
    response: { status: 200, example: j({ success: true, data: { id: 'uuid', name: 'Daily Spinner (v2)' } }) },
  },
  {
    id: 'gamru-gam-archive',
    platform: 'gamru', group: 'Gamification', method: 'POST', path: '/api/gamification/:feature/archive-by/:id',
    title: 'Archive gamification item', auth: 'jwt',
    summary: 'Soft-delete (archived=true). Item stays queryable but is hidden from players.',
    params: { fields: [
      { name: 'feature', type: 'string', required: true },
      { name: 'id', type: 'uuid', required: true },
    ]},
    body: { fields: [{ name: 'archived', type: 'boolean', required: true }] },
    response: { status: 200, example: j({ success: true, data: { id: 'uuid', archived: true } }) },
  },

  // ---- Tournament leaderboard ----
  {
    id: 'gamru-tlb-score',
    platform: 'gamru', group: 'Tournament Leaderboard', method: 'POST', path: '/api/tournament-leaderboard/:tournamentId/score',
    title: 'Submit tournament score', auth: 'client',
    summary: 'S2S — the games platform posts a player’s points; gamru updates standings and awards prizes. Idempotent on (email, tournamentId).',
    params: { fields: [{ name: 'tournamentId', type: 'string', required: true }] },
    body: { fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'name', type: 'string', required: false },
      { name: 'points', type: 'number', required: true },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Score recorded', data: { tournamentId: 't1', email: 'jane@x.com', points: 1500, rank: 3 } }) },
  },
  {
    id: 'gamru-tlb-get',
    platform: 'gamru', group: 'Tournament Leaderboard', method: 'GET', path: '/api/tournament-leaderboard/:tournamentId',
    title: 'Get standings', auth: 'jwt',
    summary: 'Back-office view of a tournament’s ranked standings.',
    params: { fields: [{ name: 'tournamentId', type: 'string', required: true }] },
    response: { status: 200, example: j([{ rank: 1, email: 'a@x.com', points: 4200 }, { rank: 2, email: 'b@x.com', points: 3900 }]) },
  },

  // ---- CRM: campaigns / segments / templates / triggers / caps ----
  {
    id: 'gamru-campaigns-add',
    platform: 'gamru', group: 'CRM — Campaigns', method: 'POST', path: '/api/campaigns/add',
    title: 'Create campaign', auth: 'jwt',
    summary: 'Create a marketing campaign bound to a segment + trigger + template.',
    body: { fields: [
      { name: 'name', type: 'string', required: true },
      { name: 'status', type: "'IN_DESIGN'|'SENT'|'SCHEDULED'|'PAUSED'|'ARCHIVED'", required: false },
      { name: 'trigger / trigger_config', type: 'string / object', required: false },
      { name: 'segment / target_group', type: 'string / object', required: false },
      { name: 'start_date / end_date', type: 'ISO date', required: false },
      { name: 'tags', type: 'string[]', required: false },
    ]},
    response: { status: 201, example: j({ success: true, data: { id: 'uuid', name: 'Welcome series', status: 'IN_DESIGN' } }) },
  },
  {
    id: 'gamru-campaigns-paginate',
    platform: 'gamru', group: 'CRM — Campaigns', method: 'GET', path: '/api/campaigns/paginate',
    title: 'List campaigns', auth: 'jwt',
    summary: 'Filterable campaign grid (search, status, trigger, tag, archived).',
    response: { status: 200, example: j({ success: true, data: [{ id: 'uuid', name: 'Welcome series', status: 'SCHEDULED' }], total: 1 }) },
  },
  {
    id: 'gamru-campaigns-archive',
    platform: 'gamru', group: 'CRM — Campaigns', method: 'POST', path: '/api/campaigns/archive/:id',
    title: 'Archive / restore campaign', auth: 'jwt',
    summary: 'Soft-delete a campaign; POST /api/campaigns/restore/:id brings it back.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, data: { id: 'uuid', status: 'ARCHIVED' } }) },
  },
  {
    id: 'gamru-segments-add',
    platform: 'gamru', group: 'CRM — Segments', method: 'POST', path: '/api/segments/add',
    title: 'Create segment', auth: 'jwt',
    summary: 'Define a STATIC or DYNAMIC audience. content holds the rule tree.',
    body: { fields: [
      { name: 'name', type: 'string', required: true },
      { name: 'type', type: "'DYNAMIC'|'STATIC'", required: false },
      { name: 'content', type: 'object', required: false, desc: 'filter rules' },
      { name: 'tags', type: 'string[]', required: false },
    ]},
    response: { status: 201, example: j({ success: true, data: { id: 'uuid', name: 'Depositors', type: 'DYNAMIC' } }) },
  },
  {
    id: 'gamru-segments-preview',
    platform: 'gamru', group: 'CRM — Segments', method: 'POST', path: '/api/segments/preview',
    title: 'Preview segment', auth: 'jwt',
    summary: 'Resolve a segment’s membership without saving it — used by the audience builder.',
    body: { fields: [{ name: 'content', type: 'object', required: true, desc: 'rule tree' }] },
    response: { status: 200, example: j({ success: true, data: { player_count: 1432, sample: [{ id: 'uuid', name: 'Jane' }] } }) },
  },
  {
    id: 'gamru-segments-players',
    platform: 'gamru', group: 'CRM — Segments', method: 'GET', path: '/api/segments/:id/players',
    title: 'Segment members', auth: 'jwt',
    summary: 'List the players currently matching a saved segment.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, data: [{ id: 'uuid', name: 'Jane', email: 'jane@x.com' }] }) },
  },
  {
    id: 'gamru-templates-add',
    platform: 'gamru', group: 'CRM — Templates', method: 'POST', path: '/api/templates/add',
    title: 'Create template', auth: 'jwt',
    summary: 'Author a message template for a channel.',
    body: { fields: [
      { name: 'name', type: 'string', required: true },
      { name: 'channel', type: "'EMAIL'|'SMS'|'ONSITE'|'WEBPUSH'|'INAPP'", required: true },
      { name: 'subject', type: 'string', required: false },
      { name: 'content', type: 'string', required: false },
      { name: 'test_recipients', type: 'string[]', required: false },
    ]},
    response: { status: 201, example: j({ success: true, data: { id: 'uuid', name: 'Welcome email', channel: 'EMAIL' } }) },
  },
  {
    id: 'gamru-triggers-add',
    platform: 'gamru', group: 'CRM — Triggers', method: 'POST', path: '/api/custom-triggers/add',
    title: 'Create custom trigger', auth: 'jwt',
    summary: 'Define a reusable trigger (builder rule tree) that campaigns can activate on.',
    body: { fields: [
      { name: 'name', type: 'string', required: true },
      { name: 'trigger', type: 'string', required: false },
      { name: 'builder', type: 'object', required: false, desc: 'condition logic' },
      { name: 'status', type: "'ACTIVE'|'INACTIVE'", required: false },
    ]},
    response: { status: 201, example: j({ success: true, data: { id: 'uuid', name: 'Big deposit', status: 'ACTIVE' } }) },
  },
  {
    id: 'gamru-caps-add',
    platform: 'gamru', group: 'CRM — Frequency Caps', method: 'POST', path: '/api/frequency-caps/add',
    title: 'Create frequency cap', auth: 'jwt',
    summary: 'Limit how many messages a channel may send per period.',
    body: { fields: [
      { name: 'channel', type: "'EMAIL'|'SMS'|'ONSITE'|'WEBPUSH'|'INAPP'", required: true },
      { name: 'period', type: "'PER_DAY'|'PER_WEEK'|'PER_MONTH'", required: true },
      { name: 'limit', type: 'number', required: true, desc: '≥ 1' },
    ]},
    response: { status: 201, example: j({ success: true, data: { id: 'uuid', channel: 'EMAIL', period: 'PER_DAY', limit: 2 } }) },
  },
  {
    id: 'gamru-unsub-add',
    platform: 'gamru', group: 'CRM — Unsubscribe', method: 'POST', path: '/api/unsubscribe-reports/add',
    title: 'Record unsubscribe', auth: 'jwt',
    summary: 'Log a player opt-out with channel + reason for reporting.',
    body: { fields: [
      { name: 'player_id', type: 'string', required: true },
      { name: 'channel', type: 'enum', required: true },
      { name: 'reason', type: 'string', required: false },
    ]},
    response: { status: 201, example: j({ success: true, data: { id: 'uuid', channel: 'EMAIL' } }) },
  },

  // ---- Analytics ----
  {
    id: 'gamru-analytics-campaigns',
    platform: 'gamru', group: 'Analytics', method: 'GET', path: '/api/analytics/campaigns',
    title: 'Campaign analytics', auth: 'jwt',
    summary: 'Aggregated sent / delivered / open / click metrics across campaigns.',
    response: { status: 200, example: j({ success: true, data: { sent: 12000, delivered: 11800, opened: 5400, clicked: 1200 } }) },
  },
  {
    id: 'gamru-analytics-track',
    platform: 'gamru', group: 'Analytics', method: 'POST', path: '/api/analytics/track',
    title: 'Track interaction', auth: 'jwt',
    summary: 'Record a delivery / open / click event for a player on a channel.',
    body: { fields: [
      { name: 'player_id', type: 'string', required: true },
      { name: 'status', type: "'SENT'|'DELIVERED'|'OPEN'|'CLICK'|'LOGIN'|'BOUNCED'|'FAILED'", required: true },
      { name: 'channel', type: "'EMAIL'|'SMS'|'WEB_PUSH'|'ONSITE'", required: true },
      { name: 'campaign_id', type: 'uuid', required: false },
    ]},
    response: { status: 201, example: j({ success: true, data: { id: 'uuid', status: 'OPEN' } }) },
  },

  // ---- Catalogs & settings (representative) ----
  {
    id: 'gamru-casino-games-add',
    platform: 'gamru', group: 'Catalogs', method: 'POST', path: '/api/casino-catalog/games/add',
    title: 'Add casino game', auth: 'jwt',
    summary: 'Register a game in the catalog. The catalog also exposes /categories and /providers (same add/update/delete/paginate pattern).',
    body: { fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'provider', type: 'string', required: true },
      { name: 'category', type: 'string', required: true },
      { name: 'device_support', type: '{ mobile, desktop }', required: false },
    ]},
    response: { status: 201, example: j({ success: true, data: { id: 'g-100', name: 'Starburst', provider: 'NetEnt' } }) },
  },
  {
    id: 'gamru-settings-bulk',
    platform: 'gamru', group: 'System Settings', method: 'PUT', path: '/api/system-settings/settings/bulk',
    title: 'Bulk upsert settings', auth: 'admin',
    summary: 'Write many panel settings at once. Panels: core, gamification, mission, crm, platform, widgets. (Also: account-statuses, payment-methods, languages, oauth-clients, webhooks, email-smtp.)',
    body: { fields: [{ name: 'items', type: 'Array<{panel,key,value,description?}>', required: true }] },
    response: { status: 200, example: j({ success: true, data: [{ panel: 'gamification', key: 'xp_boost', value: 2 }] }) },
  },
  {
    id: 'gamru-media-add',
    platform: 'gamru', group: 'Media', method: 'POST', path: '/api/media-database/add',
    title: 'Upload media', auth: 'jwt',
    summary: 'multipart/form-data image upload used for banners, mission art and email assets.',
    body: { fields: [
      { name: 'file', type: 'binary', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'category', type: 'enum', required: true, desc: 'banners | mission-banner | mission-bundles | template | …' },
    ]},
    response: { status: 201, example: j({ success: true, data: { id: 'uuid', url: 'https://cdn/.../banner.png' } }) },
  },
]

// ===========================================================================
// GAMES PLATFORM — the casino/player app that consumes gamru
// ===========================================================================
const games = [
  // Auth
  {
    id: 'games-register',
    platform: 'games', group: 'Auth', method: 'POST', path: '/api/auth/register',
    title: 'Player register', auth: 'none',
    summary: 'Create a player account. On success the platform fires USER_REGISTERED to gamru so the player gets a gamru mirror.',
    body: { fields: [
      { name: 'first_name / last_name', type: 'string', required: true },
      { name: 'email', type: 'string', required: true },
      { name: 'mobile', type: 'string', required: true },
      { name: 'password', type: 'string', required: true },
    ]},
    response: { status: 201, example: j({ id: 'uuid', email: 'jane@x.com', role: 'USER', status: 'ACTIVE' }) },
  },
  {
    id: 'games-login',
    platform: 'games', group: 'Auth', method: 'POST', path: '/api/auth/login',
    title: 'Player login', auth: 'none',
    summary: 'Authenticate and receive accessToken + refreshToken. Also pushes a once-per-day LOGIN event to gamru.',
    body: { fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'password', type: 'string', required: true },
    ]},
    response: { status: 200, example: j({ accessToken: 'eyJ...', refreshToken: 'eyJ...', user: { id: 'uuid', email: 'jane@x.com' } }) },
  },
  {
    id: 'games-refresh',
    platform: 'games', group: 'Auth', method: 'POST', path: '/api/auth/refresh',
    title: 'Refresh token', auth: 'none',
    summary: 'Rotate the refresh token (with reuse detection).',
    body: { fields: [{ name: 'refreshToken', type: 'string', required: true }] },
    response: { status: 200, example: j({ accessToken: 'eyJ...', refreshToken: 'eyJ...' }) },
  },
  {
    id: 'games-me',
    platform: 'games', group: 'Auth', method: 'GET', path: '/api/auth/me',
    title: 'Current user', auth: 'player',
    summary: 'Return the authenticated player profile.',
    response: { status: 200, example: j({ id: 'uuid', email: 'jane@x.com', first_name: 'Jane', role: 'USER' }) },
  },

  // Activity
  {
    id: 'games-activity',
    platform: 'games', group: 'Activity', method: 'POST', path: '/api/activity',
    title: 'Record activity (earn XP)', auth: 'player',
    summary: 'Log a GAME_PLAY / BET_PLACE / LOGIN. The platform computes XP (× active booster) and forwards it to gamru add-xp. idempotencyKey prevents double-award on retry.',
    body: { fields: [
      { name: 'type', type: "'GAME_PLAY'|'BET_PLACE'|'LOGIN'", required: true },
      { name: 'idempotencyKey', type: 'string', required: true },
      { name: 'gameId', type: 'string', required: false },
      { name: 'amount', type: 'number', required: false },
      { name: 'meta', type: 'object', required: false },
    ]},
    response: { status: 201, example: j({ duplicate: false, xpAwarded: 30, boostMultiplier: 2, breakdown: { base: 15, streakBonus: 0, dailyBonus: 0 }, xpTotal: 1290 }) },
  },
  {
    id: 'games-activity-history',
    platform: 'games', group: 'Activity', method: 'GET', path: '/api/activity/game-history',
    title: 'Game history', auth: 'player',
    summary: 'Paginated history of the player’s gameplay.',
    query: { fields: [{ name: 'page / limit', type: 'number' }] },
    response: { status: 200, example: j({ data: [{ id: 'uuid', gameId: 'g-100', type: 'GAME_PLAY' }], pagination: { page: 1, total: 1 } }) },
  },

  // Wallet
  {
    id: 'games-wallet',
    platform: 'games', group: 'Wallet', method: 'GET', path: '/api/wallet',
    title: 'Get wallet', auth: 'player',
    summary: 'Current balance + deposit aggregates.',
    response: { status: 200, example: j({ balance: 150.0, currency: 'USD', depositCount: 2, totalDeposit: 200.0 }) },
  },
  {
    id: 'games-wallet-deposit',
    platform: 'games', group: 'Wallet', method: 'POST', path: '/api/wallet/deposit',
    title: 'Deposit', auth: 'player',
    summary: 'Credit the wallet and fire DEPOSIT_MADE to gamru (moves the player from “no_deposit” → “depositor”).',
    body: { fields: [{ name: 'amount', type: 'number', required: true }] },
    response: { status: 200, example: j({ balance: 250.0, currency: 'USD', depositCount: 3, totalDeposit: 300.0 }) },
  },

  // Profile
  {
    id: 'games-profile',
    platform: 'games', group: 'Profile', method: 'GET', path: '/api/profile',
    title: 'Gamification profile', auth: 'player',
    summary: 'Level / rank / XP progression, sourced from gamru’s player snapshot.',
    response: { status: 200, example: j({ xpTotal: 1290, level: 7, rank: { code: 'SILVER', name: 'Silver' }, coins: 320, progress: { progressPct: 62 }, nextRank: { code: 'GOLD' } }) },
  },
  {
    id: 'games-profile-xp',
    platform: 'games', group: 'Profile', method: 'GET', path: '/api/profile/xp/history',
    title: 'XP ledger', auth: 'player',
    summary: 'Paginated XP transactions.',
    response: { status: 200, example: j({ data: [{ id: 'uuid', source: 'GAME_PLAY', xp_amount: 30, balance_after: 1290 }], pagination: { page: 1 } }) },
  },

  // Missions
  {
    id: 'games-missions-list',
    platform: 'games', group: 'Missions', method: 'GET', path: '/api/missions',
    title: 'List missions', auth: 'player',
    summary: 'Missions for the player (catalog from gamru, merged with local participation status).',
    response: { status: 200, example: j({ branding: { banner_desktop: '...', banner_mobile: '...' }, missions: [{ id: 'uuid', name: 'Spin 10x', status: 'IN_PROGRESS', progress: 4, target: 10, reward_label: '50 XP' }] }) },
  },
  {
    id: 'games-missions-join',
    platform: 'games', group: 'Missions', method: 'POST', path: '/api/missions/:id/join',
    title: 'Join mission', auth: 'player',
    summary: 'Opt into a mission. Enforces one IN_PROGRESS mission per bucket.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ id: 'uuid', status: 'IN_PROGRESS', progress: 0, target: 10 }) },
  },
  {
    id: 'games-missions-claim',
    platform: 'games', group: 'Missions', method: 'POST', path: '/api/missions/:id/claim',
    title: 'Claim mission', auth: 'player',
    summary: 'Claim a completed mission. Proxies to gamru POST /api/players/:id/missions/:missionId/claim.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ reward_label: '50 XP' }) },
  },
  {
    id: 'games-missions-cancel',
    platform: 'games', group: 'Missions', method: 'POST', path: '/api/missions/:id/cancel',
    title: 'Cancel mission', auth: 'player',
    summary: 'Abandon a running mission (progress reset).',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true }) },
  },

  // Mission bundles
  {
    id: 'games-bundles-list',
    platform: 'games', group: 'Mission Bundles', method: 'GET', path: '/api/mission-bundles',
    title: 'List bundles', auth: 'player',
    summary: 'Curated mission groups (with periodicity + progress).',
    response: { status: 200, example: j({ bundles: [{ id: 'uuid', name: 'Daily quests', periodicity: 'DAILY', completed: 2, total: 5 }] }) },
  },
  {
    id: 'games-bundles-claim',
    platform: 'games', group: 'Mission Bundles', method: 'POST', path: '/api/mission-bundles/:bundleId/missions/:missionId/claim',
    title: 'Claim mission in bundle', auth: 'player',
    summary: 'Claim a mission that belongs to a bundle (independent track; no bucket exclusivity).',
    params: { fields: [
      { name: 'bundleId', type: 'uuid', required: true },
      { name: 'missionId', type: 'uuid', required: true },
    ]},
    response: { status: 200, example: j({ reward_label: '1 Free Spin' }) },
  },

  // Tournaments
  {
    id: 'games-tournaments-list',
    platform: 'games', group: 'Tournaments', method: 'GET', path: '/api/tournaments',
    title: 'List tournaments', auth: 'player',
    summary: 'Active tournaments for the player (catalog from gamru).',
    response: { status: 200, example: j({ tournaments: [{ id: 't1', name: 'Weekend Race', state: 'IN_PROGRESS' }] }) },
  },
  {
    id: 'games-tournaments-score',
    platform: 'games', group: 'Tournaments', method: 'POST', path: '/api/tournaments/:id/score',
    title: 'Submit score', auth: 'player',
    summary: 'Submit points; proxies to gamru POST /api/tournament-leaderboard/:id/score.',
    params: { fields: [{ name: 'id', type: 'string', required: true }] },
    body: { fields: [
      { name: 'points', type: 'number', required: true },
      { name: 'game', type: 'string', required: false },
    ]},
    response: { status: 200, example: j({ score_recorded: true }) },
  },

  // Rewards
  {
    id: 'games-rewards-list',
    platform: 'games', group: 'Rewards', method: 'GET', path: '/api/rewards',
    title: 'List rewards', auth: 'player',
    summary: 'Player rewards (from gamru when the email resolves, else local fallback).',
    query: { fields: [{ name: 'page / limit / status', type: 'mixed' }] },
    response: { status: 200, example: j({ data: [{ id: 'uuid', reward_type: 'BONUS_CASH', status: 'IN_PROGRESS' }], pagination: { page: 1 } }) },
  },
  {
    id: 'games-rewards-claim',
    platform: 'games', group: 'Rewards', method: 'POST', path: '/api/rewards/:id/claim',
    title: 'Claim reward', auth: 'player',
    summary: 'Claim a reward; proxies to gamru when the player is found, else local claim.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ message: 'Reward claimed', data: { id: 'uuid', status: 'CLAIMED' } }) },
  },
  {
    id: 'games-rewards-pending',
    platform: 'games', group: 'Rewards', method: 'GET', path: '/api/rewards/pending-count',
    title: 'Pending reward count', auth: 'player',
    summary: 'Badge count of unclaimed rewards.',
    response: { status: 200, example: j({ count: 2 }) },
  },

  // Reward shop
  {
    id: 'games-shop-products',
    platform: 'games', group: 'Reward Shop', method: 'GET', path: '/api/reward-shop/products',
    title: 'Shop products', auth: 'player',
    summary: 'Token-spend catalog (products + boosters) with affordability flags.',
    response: { status: 200, example: j({ tokens: 320, data: [{ id: 'uuid', name: 'XP Booster', tokenPrice: 100, category: 'booster', affordable: true }] }) },
  },
  {
    id: 'games-shop-buy',
    platform: 'games', group: 'Reward Shop', method: 'POST', path: '/api/reward-shop/buy',
    title: 'Buy product', auth: 'player',
    summary: 'Spend tokens; proxies to gamru POST /api/players/:id/reward-shop/purchase (atomic).',
    body: { fields: [
      { name: 'productId', type: 'string', required: true },
      { name: 'quantity', type: 'number', required: false },
    ]},
    response: { status: 200, example: j({ tokensRemaining: 220, tokensSpent: 100, boosterActivated: true, purchase: { id: 'uuid', status: 'ACTIVE' } }) },
  },
  {
    id: 'games-shop-boosters',
    platform: 'games', group: 'Reward Shop', method: 'GET', path: '/api/reward-shop/boosters',
    title: 'Active boosters', auth: 'player',
    summary: 'Active + expired boosters owned by the player (drives the XP multiplier).',
    response: { status: 200, example: j({ data: [{ id: 'uuid', kind: 'xp', multiplier: 2, secondsRemaining: 1800 }] }) },
  },

  // Leaderboard
  {
    id: 'games-lb-global',
    platform: 'games', group: 'Leaderboard', method: 'GET', path: '/api/leaderboard/global',
    title: 'Global leaderboard', auth: 'player',
    summary: 'All-time leaderboard. /weekly and /monthly mirror this; /me returns the player’s ranks.',
    query: { fields: [{ name: 'page / limit', type: 'number' }] },
    response: { status: 200, example: j({ data: [{ rank: 1, name: 'Ace', score: 9000, is_me: false }], pagination: { page: 1 } }) },
  },

  // Notifications
  {
    id: 'games-notifications',
    platform: 'games', group: 'Notifications', method: 'GET', path: '/api/notifications',
    title: 'List notifications', auth: 'player',
    summary: 'DB notifications plus virtual “pending reward” rows pulled live from gamru (id prefixed reward:).',
    query: { fields: [{ name: 'page / limit / unread', type: 'mixed' }] },
    response: { status: 200, example: j({ data: [{ id: 'reward:uuid', type: 'REWARD_UNLOCKED', title: 'Reward ready', read_at: null }], pagination: { page: 1 } }) },
  },
  {
    id: 'games-notifications-read',
    platform: 'games', group: 'Notifications', method: 'PATCH', path: '/api/notifications/:id/read',
    title: 'Mark read', auth: 'player',
    summary: 'Mark one notification read; PATCH /read-all marks all.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true }) },
  },

  // Config
  {
    id: 'games-config',
    platform: 'games', group: 'Config', method: 'GET', path: '/api/levels',
    title: 'Levels / ranks / xp rules', auth: 'player',
    summary: 'Read level tiers. Companion read endpoints: GET /api/ranks, GET /api/xp/rules (admin). Admin can POST/DELETE /api/xp/rules and POST /api/xp/admin/grant.',
    response: { status: 200, example: j({ data: [{ level: 7, xpStart: 1000, xpEnd: 1500 }] }) },
  },
]

// Gamru-only portal: this is a service-consumer's reference to the Gamru API.
// The games-platform endpoints are intentionally NOT surfaced — every consuming
// platform is different and builds its own API; they all use Gamru as a service.
export const ENDPOINTS = [...gamru]
void games // retained for reference; not exposed in the docs UI

// ---------------------------------------------------------------------------
// Audience split — the docs portal has two panels:
//   'user'  → the client-key surface a consuming platform calls (register a
//             player, read progress, claim, purchase, submit scores).
//   'admin' → the operator/console surface (create / update / delete missions,
//             ranks, templates, segments, campaigns, settings, …).
//   'both'  → callable from either side.
// Assigned by id here so the endpoint objects above stay readable.
// ---------------------------------------------------------------------------
const USER_ENDPOINT_IDS = new Set([
  'gamru-clients-me',
  'gamru-users-add',
  'gamru-integration-events',
  'gamru-players-by-email',
  'gamru-players-add-xp',
  'gamru-players-mission-claim',
  'gamru-players-reward-claim',
  'gamru-players-shop-purchase',
  'gamru-tlb-score',
])
const BOTH_ENDPOINT_IDS = new Set(['gamru-health', 'gamru-players-get'])

for (const e of ENDPOINTS) {
  e.audience = BOTH_ENDPOINT_IDS.has(e.id)
    ? 'both'
    : USER_ENDPOINT_IDS.has(e.id)
    ? 'user'
    : 'admin'
}

// True when an endpoint should appear for the given audience ('user'|'admin').
// A 'both' endpoint matches either; no audience means "match all".
export const matchesAudience = (e, audience) =>
  !audience || e.audience === audience || e.audience === 'both'

// Build ordered groups per platform (optionally filtered by audience),
// preserving insertion order.
export function groupsFor(platform, audience) {
  const match = (e) => e.platform === platform && matchesAudience(e, audience)
  const seen = []
  for (const e of ENDPOINTS) {
    if (!match(e)) continue
    if (!seen.includes(e.group)) seen.push(e.group)
  }
  return seen.map((g) => ({ group: g, items: ENDPOINTS.filter((e) => match(e) && e.group === g) }))
}

export function endpointById(id) {
  return ENDPOINTS.find((e) => e.id === id)
}
