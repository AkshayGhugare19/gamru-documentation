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
    headers: [
      { name: 'x-client-auth-key', desc: 'your client key — marks the account EXTERNAL to your client' },
    ],
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
      { name: 'meta', type: 'object', required: false, desc: 'free-form JSON; usual keys by type → DEPOSIT_MADE: { method, currency } · XP_AWARDED: { reason } · LEVEL_UP: { from_level, to_level } · RANK_UP: { from_rank, to_rank } · USER_REGISTERED: (none)' },
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
    summary: 'Create a mission, bundle, rank, rule, tournament, etc. Feature-specific config lives in the data JSONB blob (e.g. a mission’s objectives, a rank’s level ladder). For RANKS you can pin Games platform bonus IDs: per-level via data.levels[].bonus_ids and rank-wide via data.bonus_ids — on save GAMRU fetches those bonus definitions from the games platform and snapshots them into the Bonuses table (see the Bonuses group).',
    params: { fields: [{ name: 'feature', type: 'string', required: true }] },
    body: { fields: [
      { name: 'name', type: 'string', required: true, desc: '1–200 chars' },
      { name: 'status', type: "'ACTIVE'|'INACTIVE'", required: false },
      { name: 'priority', type: 'number', required: false },
      { name: 'tags', type: 'string[]', required: false },
      { name: 'data', type: 'object', required: false, desc: 'feature-specific (objectives / levels / reward)' },
      { name: 'data.levels[].bonus_ids', type: 'string[]', required: false, desc: 'ranks only — Games platform bonus IDs granted when the player reaches that level' },
      { name: 'data.bonus_ids', type: 'string[] | csv', required: false, desc: 'ranks only — rank-wide Games platform bonus IDs, granted once ALL levels in the rank are completed' },
    ]},
    response: { status: 201, example: j({ success: true, data: { id: 'uuid', name: 'Bronze', status: 'ACTIVE', data: { levels: [{ level: 1, xp_start: 0, xp_end: 100, bonus_ids: ['b0000001-0000-4000-8000-000000000002'] }], bonus_ids: ['b0000001-0000-4000-8000-000000000003'] } } }) },
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

  {
    id: 'gamru-gam-get',
    platform: 'gamru', group: 'Gamification', method: 'GET', path: '/api/gamification/:feature/:id',
    title: 'Get one gamification item', auth: 'jwt',
    summary: 'Fetch a single item of any feature by id (e.g. one mission or one tournament). Returns 404 if it does not exist.',
    params: { fields: [
      { name: 'feature', type: 'string', required: true, desc: 'feature key (missions, tournaments, …)' },
      { name: 'id', type: 'uuid', required: true },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Mission fetched successfully', data: { id: 'uuid', name: 'Daily Spinner', status: 'ACTIVE', data: {} } }) },
  },
  {
    id: 'gamru-gam-delete',
    platform: 'gamru', group: 'Gamification', method: 'DELETE', path: '/api/gamification/:feature/:id',
    title: 'Delete gamification item', auth: 'jwt',
    summary: 'Hard-delete an item (mission, tournament, rule, …). This is permanent — prefer archive-by/:id when you only want to hide it from players.',
    params: { fields: [
      { name: 'feature', type: 'string', required: true },
      { name: 'id', type: 'uuid', required: true },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Mission deleted successfully', data: null }) },
  },

  // ---- Missions (operator authoring — concrete paths of the gamification router) ----
  {
    id: 'gamru-missions-add',
    platform: 'gamru', group: 'Missions', method: 'POST', path: '/api/gamification/missions/add',
    title: 'Create a mission', auth: 'jwt',
    summary:
      'Author a mission. Its objective(s), time window and reward live in the data JSONB blob — that is exactly what the engine reads to track per-player progress and what it grants on claim. Set status ACTIVE to make it live.',
    body: { fields: [
      { name: 'name', type: 'string', required: true, desc: '1–200 chars' },
      { name: 'description', type: 'string', required: false },
      { name: 'status', type: "'ACTIVE' | 'INACTIVE'", required: false, desc: 'default INACTIVE — set ACTIVE to go live' },
      { name: 'priority', type: 'number', required: false, desc: 'higher shows first' },
      { name: 'tags', type: 'string[]', required: false },
      { name: 'data.objectives', type: 'object[]', required: true, desc: '{ event, measure: "count"|"amount", target, game_category?, min_bet? }' },
      { name: 'data.time', type: 'object', required: false, desc: '{ type: "lifetime" } or { type: "custom", start, end }' },
      { name: 'data.reward_type', type: 'string', required: false, desc: 'bonus_cash | free_spins | xp | tokens' },
      { name: 'data.reward_amount', type: 'number', required: false, desc: 'the reward granted on claim' },
    ]},
    bodyExample: {
      name: 'Spin 10 slots',
      description: 'Play 10 slot rounds to win bonus cash',
      status: 'ACTIVE',
      priority: 1,
      tags: ['daily'],
      data: {
        objectives: [{ event: 'WAGER', measure: 'count', target: 10, game_category: 'slots', min_bet: 1 }],
        time: { type: 'lifetime' },
        reward_type: 'bonus_cash',
        reward_amount: 10,
      },
    },
    response: { status: 201, example: j({ success: true, message: 'Mission created successfully', data: { id: 'uuid', name: 'Spin 10 slots', status: 'ACTIVE' } }) },
  },
  {
    id: 'gamru-missions-paginate',
    platform: 'gamru', group: 'Missions', method: 'GET', path: '/api/gamification/missions/paginate',
    title: 'List missions', auth: 'jwt',
    summary: 'Paginated mission grid with search, status, tag and archived filters — the console’s Missions table.',
    query: { fields: [
      { name: 'page / limit', type: 'number', desc: 'default 1 / 25' },
      { name: 'search', type: 'string' },
      { name: 'status', type: "'ACTIVE' | 'INACTIVE'" },
      { name: 'archived', type: 'boolean' },
      { name: 'tag', type: 'string' },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Mission fetched successfully', data: [{ id: 'uuid', name: 'Spin 10 slots', status: 'ACTIVE' }], total: 1, page: 1, limit: 25 }) },
  },
  {
    id: 'gamru-missions-get',
    platform: 'gamru', group: 'Missions', method: 'GET', path: '/api/gamification/missions/:id',
    title: 'Get a mission', auth: 'jwt',
    summary: 'Fetch one mission by id, including its full data blob (objectives, time, reward).',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Mission fetched successfully', data: { id: 'uuid', name: 'Spin 10 slots', status: 'ACTIVE', data: { objectives: [{ event: 'WAGER', measure: 'count', target: 10 }], reward_type: 'bonus_cash', reward_amount: 10 } } }) },
  },
  {
    id: 'gamru-missions-update',
    platform: 'gamru', group: 'Missions', method: 'POST', path: '/api/gamification/missions/update-by/:id',
    title: 'Update a mission', auth: 'jwt',
    summary: 'Edit any field of a mission. Send the whole object you want saved (same shape as create) — the data blob is replaced, so include the objectives/reward you want to keep.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    bodyExample: {
      name: 'Spin 15 slots',
      status: 'ACTIVE',
      data: {
        objectives: [{ event: 'WAGER', measure: 'count', target: 15, game_category: 'slots' }],
        time: { type: 'lifetime' },
        reward_type: 'bonus_cash',
        reward_amount: 15,
      },
    },
    response: { status: 200, example: j({ success: true, message: 'Mission updated successfully', data: { id: 'uuid', name: 'Spin 15 slots' } }) },
  },
  {
    id: 'gamru-missions-archive',
    platform: 'gamru', group: 'Missions', method: 'POST', path: '/api/gamification/missions/archive-by/:id',
    title: 'Archive / restore a mission', auth: 'jwt',
    summary: 'Soft-delete: archived=true hides the mission from players but keeps it queryable. Send archived=false to restore it.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    body: { fields: [{ name: 'archived', type: 'boolean', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Mission updated successfully', data: { id: 'uuid', archived: true } }) },
  },
  {
    id: 'gamru-missions-delete',
    platform: 'gamru', group: 'Missions', method: 'DELETE', path: '/api/gamification/missions/:id',
    title: 'Delete a mission', auth: 'jwt',
    summary: 'Permanently remove a mission. Prefer archive when you only want to take it offline — delete is irreversible.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Mission deleted successfully', data: null }) },
  },
  {
    id: 'gamru-missions-participants',
    platform: 'gamru', group: 'Missions', method: 'GET', path: '/api/gamification/missions/:id/participants',
    title: 'List participated players', auth: 'jwt',
    summary:
      'The players who participated in this mission — the operator-console list behind the “Participated” count. Each row carries the player’s status (IN_PROGRESS / COMPLETED / CLAIMED), source and join date. Filter by player source with ?source=. Participation is pushed by the games platform on join/claim (see the player-side “Record participation” endpoint).',
    params: { fields: [{ name: 'id', type: 'uuid', required: true, desc: 'mission id' }] },
    query: { fields: [
      { name: 'page / limit', type: 'number', desc: 'default 1 / 10' },
      { name: 'source', type: 'string', desc: 'filter by player source (e.g. GAMRU, GAMIFY_ENGAGE)' },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Participants fetched successfully', data: { data: [{ player_id: 'uuid', external_id: 'P-1001', name: 'Jane', email: 'jane@x.com', status: 'IN_PROGRESS', source: 'GAMIFY_ENGAGE', joined_at: '2026-06-17T10:00:00Z' }], total: 1, page: 1, limit: 10, sources: ['GAMIFY_ENGAGE', 'GAMRU'] } }) },
  },

  // ---- Mission Bundles (operator authoring) ----
  {
    id: 'gamru-bundles-add',
    platform: 'gamru', group: 'Mission Bundles', method: 'POST', path: '/api/gamification/mission-bundles/add',
    title: 'Create a mission bundle', auth: 'jwt',
    summary:
      'A bundle is a curated GROUPING of existing missions into a periodic quest (daily / weekly / monthly / lifetime). It carries no reward of its own — the player completes and claims each mission individually. The grouped mission ids, periodicity, banners and eligibility live in the data JSONB blob.',
    body: { fields: [
      { name: 'name', type: 'string', required: true, desc: '1–200 chars' },
      { name: 'description', type: 'string', required: false },
      { name: 'status', type: "'ACTIVE' | 'INACTIVE'", required: false, desc: 'default INACTIVE — set ACTIVE to publish' },
      { name: 'priority', type: 'number', required: false },
      { name: 'tags', type: 'string[]', required: false },
      { name: 'data.periodicity', type: 'string', required: false, desc: 'DAILY | WEEKLY | MONTHLY | LIFETIME — controls reset' },
      { name: 'data.bundle_type', type: 'string', required: false, desc: 'Lifetime | Custom' },
      { name: 'data.missions', type: 'object[]', required: true, desc: 'the grouped missions — [{ id, name }] referencing the missions table' },
      { name: 'data.large_image / data.small_image', type: 'string', required: false, desc: 'banner (desktop / mobile)' },
      { name: 'data.eligibility_type', type: 'string', required: false, desc: 'All Players | Segment' },
      { name: 'data.segment', type: 'string[]', required: false, desc: 'segment names when eligibility_type = Segment' },
      { name: 'data.start_date / data.end_date', type: 'ISO date', required: false, desc: 'when bundle_type = Custom' },
    ]},
    bodyExample: {
      name: 'Daily quests',
      description: 'Finish all three to clear today’s quests',
      status: 'ACTIVE',
      priority: 1,
      tags: ['daily'],
      data: {
        periodicity: 'DAILY',
        bundle_type: 'Lifetime',
        missions: [
          { id: 'm1', name: 'Spin 10 slots' },
          { id: 'm2', name: 'Make a deposit' },
        ],
        large_image: 'https://cdn.example.com/bundles/daily-desktop.png',
        small_image: 'https://cdn.example.com/bundles/daily-mobile.png',
        eligibility_type: 'All Players',
        segment: [],
      },
    },
    response: { status: 201, example: j({ success: true, message: 'Mission Bundle created successfully', data: { id: 'b1', name: 'Daily quests', status: 'ACTIVE' } }) },
  },
  {
    id: 'gamru-bundles-paginate',
    platform: 'gamru', group: 'Mission Bundles', method: 'GET', path: '/api/gamification/mission-bundles/paginate',
    title: 'List mission bundles', auth: 'jwt',
    summary: 'Paginated bundle grid with search, status, tag and archived filters.',
    query: { fields: [
      { name: 'page / limit', type: 'number', desc: 'default 1 / 25' },
      { name: 'search', type: 'string' },
      { name: 'status', type: "'ACTIVE' | 'INACTIVE'" },
      { name: 'archived', type: 'boolean' },
      { name: 'tag', type: 'string' },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Mission Bundle fetched successfully', data: [{ id: 'b1', name: 'Daily quests', status: 'ACTIVE' }], total: 1, page: 1, limit: 25 }) },
  },
  {
    id: 'gamru-bundles-get',
    platform: 'gamru', group: 'Mission Bundles', method: 'GET', path: '/api/gamification/mission-bundles/:id',
    title: 'Get a mission bundle', auth: 'jwt',
    summary: 'Fetch one bundle by id, including its data blob (grouped missions, periodicity, eligibility).',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Mission Bundle fetched successfully', data: { id: 'b1', name: 'Daily quests', status: 'ACTIVE', data: { periodicity: 'DAILY', missions: [{ id: 'm1', name: 'Spin 10 slots' }] } } }) },
  },
  {
    id: 'gamru-bundles-update',
    platform: 'gamru', group: 'Mission Bundles', method: 'POST', path: '/api/gamification/mission-bundles/update-by/:id',
    title: 'Update a mission bundle', auth: 'jwt',
    summary: 'Edit any field of a bundle. The data blob is replaced wholesale — include the full missions array and settings you want to keep.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    bodyExample: {
      name: 'Daily quests',
      status: 'ACTIVE',
      data: {
        periodicity: 'DAILY',
        bundle_type: 'Lifetime',
        missions: [
          { id: 'm1', name: 'Spin 10 slots' },
          { id: 'm2', name: 'Make a deposit' },
          { id: 'm3', name: 'Win a round' },
        ],
        eligibility_type: 'All Players',
      },
    },
    response: { status: 200, example: j({ success: true, message: 'Mission Bundle updated successfully', data: { id: 'b1', name: 'Daily quests' } }) },
  },
  {
    id: 'gamru-bundles-archive',
    platform: 'gamru', group: 'Mission Bundles', method: 'POST', path: '/api/gamification/mission-bundles/archive-by/:id',
    title: 'Archive / restore a mission bundle', auth: 'jwt',
    summary: 'Soft-delete: archived=true hides the bundle from players but keeps it queryable. Send archived=false to restore.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    body: { fields: [{ name: 'archived', type: 'boolean', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Mission Bundle updated successfully', data: { id: 'b1', archived: true } }) },
  },
  {
    id: 'gamru-bundles-delete',
    platform: 'gamru', group: 'Mission Bundles', method: 'DELETE', path: '/api/gamification/mission-bundles/:id',
    title: 'Delete a mission bundle', auth: 'jwt',
    summary: 'Permanently remove a bundle definition (the grouped missions themselves are untouched). Prefer archive to take it offline.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Mission Bundle deleted successfully', data: null }) },
  },
  {
    id: 'gamru-bundles-participants',
    platform: 'gamru', group: 'Mission Bundles', method: 'GET', path: '/api/gamification/mission-bundles/:id/participants',
    title: 'List participated players', auth: 'jwt',
    summary:
      'The players who participated in this bundle — keyed by the bundle id, independent of the missions inside it (a standalone mission play never counts here). Each row carries status, source and join date; filter by ?source=. Participation is pushed by the games platform when a player joins/claims a mission inside the bundle.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true, desc: 'mission-bundle id' }] },
    query: { fields: [
      { name: 'page / limit', type: 'number', desc: 'default 1 / 10' },
      { name: 'source', type: 'string', desc: 'filter by player source' },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Participants fetched successfully', data: { data: [{ player_id: 'uuid', external_id: 'P-1001', name: 'Jane', email: 'jane@x.com', status: 'IN_PROGRESS', source: 'GAMIFY_ENGAGE', joined_at: '2026-06-17T10:00:00Z' }], total: 1, page: 1, limit: 10, sources: ['GAMIFY_ENGAGE', 'GAMRU'] } }) },
  },

  // ---- Tournaments (operator authoring) ----
  {
    id: 'gamru-tournaments-add',
    platform: 'gamru', group: 'Tournaments', method: 'POST', path: '/api/gamification/tournaments/add',
    title: 'Create a tournament', auth: 'jwt',
    summary:
      'Author a tournament. The schedule, scoring and prize ladder live in the data JSONB blob (presentation/config). The standings themselves are keyed by this tournament’s id — players’ points arrive via the leaderboard score endpoint.',
    body: { fields: [
      { name: 'name', type: 'string', required: true, desc: '1–200 chars' },
      { name: 'description', type: 'string', required: false },
      { name: 'status', type: "'ACTIVE' | 'INACTIVE'", required: false, desc: 'default INACTIVE — set ACTIVE to go live' },
      { name: 'priority', type: 'number', required: false },
      { name: 'tags', type: 'string[]', required: false },
      { name: 'data.start_date / data.end_date', type: 'ISO date', required: false, desc: 'competition window' },
      { name: 'data.metric', type: 'string', required: false, desc: 'what a “point” represents, e.g. points / wagered' },
      { name: 'data.scoring_event', type: 'string', required: false, desc: 'the action that earns points, e.g. WAGER' },
      { name: 'data.prizes', type: 'object[]', required: false, desc: '[{ rank, reward_type, amount }]' },
      { name: 'data.banner', type: 'string', required: false, desc: 'banner image URL' },
    ]},
    bodyExample: {
      name: 'Weekend Race',
      description: 'Top wagerers win bonus cash this weekend',
      status: 'ACTIVE',
      priority: 1,
      tags: ['weekly'],
      data: {
        start_date: '2026-06-20T00:00:00Z',
        end_date: '2026-06-22T23:59:59Z',
        metric: 'points',
        scoring_event: 'WAGER',
        prizes: [
          { rank: 1, reward_type: 'bonus_cash', amount: 500 },
          { rank: 2, reward_type: 'bonus_cash', amount: 250 },
        ],
        banner: 'https://cdn.example.com/tournaments/weekend-race.png',
      },
    },
    response: { status: 201, example: j({ success: true, message: 'Tournament created successfully', data: { id: 't1', name: 'Weekend Race', status: 'ACTIVE' } }) },
  },
  {
    id: 'gamru-tournaments-paginate',
    platform: 'gamru', group: 'Tournaments', method: 'GET', path: '/api/gamification/tournaments/paginate',
    title: 'List tournaments', auth: 'jwt',
    summary: 'Paginated tournament grid with search, status, tag and archived filters.',
    query: { fields: [
      { name: 'page / limit', type: 'number', desc: 'default 1 / 25' },
      { name: 'search', type: 'string' },
      { name: 'status', type: "'ACTIVE' | 'INACTIVE'" },
      { name: 'archived', type: 'boolean' },
      { name: 'tag', type: 'string' },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Tournament fetched successfully', data: [{ id: 't1', name: 'Weekend Race', status: 'ACTIVE' }], total: 1, page: 1, limit: 25 }) },
  },
  {
    id: 'gamru-tournaments-get',
    platform: 'gamru', group: 'Tournaments', method: 'GET', path: '/api/gamification/tournaments/:id',
    title: 'Get a tournament', auth: 'jwt',
    summary: 'Fetch one tournament definition by id, including its full data blob (schedule, scoring, prizes).',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Tournament fetched successfully', data: { id: 't1', name: 'Weekend Race', status: 'ACTIVE', data: { start_date: '2026-06-20T00:00:00Z', prizes: [{ rank: 1, reward_type: 'bonus_cash', amount: 500 }] } } }) },
  },
  {
    id: 'gamru-tournaments-update',
    platform: 'gamru', group: 'Tournaments', method: 'POST', path: '/api/gamification/tournaments/update-by/:id',
    title: 'Update a tournament', auth: 'jwt',
    summary: 'Edit any field of a tournament. The data blob is replaced wholesale — include the schedule/prizes you want to keep.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    bodyExample: {
      name: 'Weekend Race (Extended)',
      status: 'ACTIVE',
      data: {
        start_date: '2026-06-20T00:00:00Z',
        end_date: '2026-06-23T23:59:59Z',
        metric: 'points',
        scoring_event: 'WAGER',
        prizes: [{ rank: 1, reward_type: 'bonus_cash', amount: 750 }],
      },
    },
    response: { status: 200, example: j({ success: true, message: 'Tournament updated successfully', data: { id: 't1', name: 'Weekend Race (Extended)' } }) },
  },
  {
    id: 'gamru-tournaments-archive',
    platform: 'gamru', group: 'Tournaments', method: 'POST', path: '/api/gamification/tournaments/archive-by/:id',
    title: 'Archive / restore a tournament', auth: 'jwt',
    summary: 'Soft-delete: archived=true hides the tournament from players but keeps it queryable. Send archived=false to restore.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    body: { fields: [{ name: 'archived', type: 'boolean', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Tournament updated successfully', data: { id: 't1', archived: true } }) },
  },
  {
    id: 'gamru-tournaments-delete',
    platform: 'gamru', group: 'Tournaments', method: 'DELETE', path: '/api/gamification/tournaments/:id',
    title: 'Delete a tournament', auth: 'jwt',
    summary: 'Permanently remove a tournament definition. Prefer archive when you only want to take it offline.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Tournament deleted successfully', data: null }) },
  },
  {
    id: 'gamru-tlb-get',
    platform: 'gamru', group: 'Tournaments', method: 'GET', path: '/api/tournament-leaderboard/:tournamentId',
    title: 'Get tournament standings', auth: 'jwt',
    summary: 'Back-office view of a tournament’s ranked standings. tournamentId is the id of the tournament you created above.',
    params: { fields: [{ name: 'tournamentId', type: 'string', required: true, desc: 'the tournament’s id' }] },
    response: { status: 200, example: j({ success: true, message: 'Leaderboard fetched', data: [{ rank: 1, email: 'a@x.com', name: 'Ace', score: 4200 }, { rank: 2, email: 'b@x.com', name: 'Bea', score: 3900 }] }) },
  },


  // ---- Profile / progression / ranks / rewards / shop (player surface) ----
  // Almost everything a player sees is one POST /api/players/by-email snapshot;
  // each tab below reads a different slice of it, plus the S2S write it needs.
  {
    id: 'gamru-user-profile-get',
    platform: 'gamru', group: 'Profile (player)', method: 'POST', path: '/api/players/by-email',
    title: 'Get player profile', auth: 'client',
    summary:
      'The player snapshot — identity plus the gamification block. Read the top-level fields (name, level, rank_name, xp_points, tokens) and gamification.progress for the profile header. This one call also carries ranks, rank progress, missions, tournaments, rewards and the reward shop — each documented in its own tab.',
    body: { fields: [{ name: 'email', type: 'string', required: true }] },
    response: { status: 200, example: j({ success: true, data: { id: 'uuid', email: 'jane@x.com', name: 'Jane', level: 7, rank_name: 'Silver', xp_points: 1240, tokens: 320, gamification: { progress: { level: 7, rank_name: 'Silver', xp_points: 1240, xp_to_next: 210 } } } }) },
  },
  {
    id: 'gamru-players-add-xp',
    platform: 'gamru', group: 'XP Points (player)', method: 'POST', path: '/api/players/by-email/add-xp',
    title: 'Add XP directly (by email)', auth: 'client',
    summary:
      'Award an explicit XP amount to a player identified by email, and read the recomputed level/rank straight back. Use this when your platform decides the amount (e.g. after applying a booster). The engine recomputes level, rank and xp_to_next from the ladder; the optional game block feeds the player’s casino personalization (favourite category / provider).',
    body: { fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'amount', type: 'number', required: true, desc: 'XP delta; may be 0 if game provided' },
      { name: 'game', type: 'object', required: false, desc: '{ id, name, category, provider, turnover }' },
    ]},
    response: { status: 200, example: j({ success: true, data: { id: 'uuid', xp_points: 1290, level: 7, rank_name: 'Silver', xp_to_next: 210 } }) },
  },
  {
    id: 'gamru-user-xp-event',
    platform: 'gamru', group: 'XP Points (player)', method: 'POST', path: '/api/integration/events',
    title: 'Award XP via event (rules decide)', auth: 'client',
    summary:
      'The other way to hand a player XP: push an XP_AWARDED event and let the engine apply it and recompute level/rank. Use this when XP amounts are governed by your Gamru-side rules rather than computed on your platform. Idempotent on event_id; needs the shared service key and your client key.',
    headers: [
      { name: 'x-service-key', desc: 'shared service secret — required (serviceAuth)' },
      { name: 'x-client-auth-key', desc: 'your client key — required (clientAuth)' },
    ],
    body: { fields: [
      { name: 'event_id', type: 'string', required: true, desc: 'unique & stable (1–180 chars) — dedupe key' },
      { name: 'event_type', type: 'enum', required: true, desc: 'XP_AWARDED for this tab (the hook also accepts USER_REGISTERED | LEVEL_UP | RANK_UP | DEPOSIT_MADE)' },
      { name: 'external_id', type: 'string', required: true, desc: 'your platform’s user id (1–120 chars)' },
      { name: 'origin', type: 'string', required: false, desc: 'your platform name (≤40 chars)' },
      { name: 'email', type: 'string|null', required: false, desc: 'links the event to the player' },
      { name: 'amount', type: 'number', required: true, desc: 'the XP delta to apply' },
      { name: 'meta', type: 'object', required: false, desc: '{ reason } — free-form context' },
    ]},
    bodyExample: {
      event_id: 'XP_AWARDED:P-1001:bonus-7',
      event_type: 'XP_AWARDED',
      external_id: 'P-1001',
      origin: 'lucky-casino',
      email: 'jane@x.com',
      amount: 50,
      meta: { reason: 'daily_bonus' },
    },
    response: { status: 200, example: j({ success: true, message: 'Event processed', data: { applied: true, duplicate: false } }) },
  },
  {
    id: 'gamru-user-rankprogress-get',
    platform: 'gamru', group: 'Rank progress (player)', method: 'POST', path: '/api/players/by-email',
    title: 'Get rank progress', auth: 'client',
    summary:
      'Use gamification.progress (current level / rank / xp_points and xp_to_next) and gamification.next_rank (the rank being climbed toward, with xp_remaining) to draw the “62% to next rank” bar. The engine recomputes both from the XP ladder on every fetch.',
    body: { fields: [{ name: 'email', type: 'string', required: true }] },
    response: { status: 200, example: j({ success: true, data: { gamification: { progress: { level: 7, rank_name: 'Silver', xp_points: 1240, xp_to_next: 210, max_level: 30 }, next_rank: { rank_name: 'Gold', level: 8, xp_required: 1450, xp_remaining: 210 } } } }) },
  },
  {
    id: 'gamru-user-ranks-get',
    platform: 'gamru', group: 'Ranks (player)', method: 'POST', path: '/api/players/by-email',
    title: 'Get ranks', auth: 'client',
    summary:
      'gamification.ranks is the full configured ladder of rank tiers; gamification.levels is the per-level XP bands. Render the ranks roadmap and highlight the player’s current tier from gamification.progress.rank_name.',
    body: { fields: [{ name: 'email', type: 'string', required: true }] },
    response: { status: 200, example: j({ success: true, data: { gamification: { ranks: [{ id: 'uuid', name: 'Bronze' }, { id: 'uuid', name: 'Silver' }, { id: 'uuid', name: 'Gold' }], levels: [{ level: 7, rank_name: 'Silver', xp_start: 1000, xp_end: 1450 }] } } }) },
  },
  {
    id: 'gamru-user-rewards-get',
    platform: 'gamru', group: 'Rewards (player)', method: 'POST', path: '/api/players/by-email',
    title: 'Get a player’s rewards', auth: 'client',
    summary:
      'gamification.rewards is the player’s reward ledger — each row carries a status (IN_PROGRESS → GRANTED / CLAIMED) and the reward itself. Show the unclaimed ones with a “Claim” button; gamru is the ledger of record.',
    body: { fields: [{ name: 'email', type: 'string', required: true }] },
    response: { status: 200, example: j({ success: true, data: { gamification: { rewards: [{ id: 'r1', reward_type: 'bonus_cash', reward: 'Spin 10 slots — 10', status: 'IN_PROGRESS' }, { id: 'r2', reward_type: 'xp', reward: 'Daily bonus — 50', status: 'GRANTED' }] } } }) },
  },
  {
    id: 'gamru-players-reward-claim',
    platform: 'gamru', group: 'Rewards (player)', method: 'POST', path: '/api/players/:id/rewards/:rewardId/claim',
    title: 'Claim a reward', auth: 'client',
    summary:
      'When a player taps “claim” on an IN_PROGRESS reward, call this. gamru applies the reward’s effect (XP via the rank engine, tokens, or records bonus cash / free spins), writes the audit row and flips it to CLAIMED. id is the gamru player id; rewardId is the reward’s id from the rewards list.',
    params: { fields: [
      { name: 'id', type: 'uuid', required: true, desc: 'player id' },
      { name: 'rewardId', type: 'uuid', required: true, desc: 'reward id from gamification.rewards' },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Reward claimed', data: { reward: { id: 'r1', status: 'GRANTED' }, player: { tokens: 320, xp_points: 1290 } } }) },
  },
  {
    id: 'gamru-user-shop-get',
    platform: 'gamru', group: 'Reward Shop (player)', method: 'POST', path: '/api/players/by-email',
    title: 'Get reward-shop products', auth: 'client',
    summary:
      'gamification.reward_shop is the token-spend catalog (products + boosters). Compare each item’s data.token_price against the player’s tokens balance (also on the snapshot) to flag what’s affordable.',
    body: { fields: [{ name: 'email', type: 'string', required: true }] },
    response: { status: 200, example: j({ success: true, data: { tokens: 320, gamification: { reward_shop: [{ id: 's1', name: 'XP Booster', data: { token_price: 100, stock_available: 25 } }] } } }) },
  },
  {
    id: 'gamru-players-shop-purchase',
    platform: 'gamru', group: 'Reward Shop (player)', method: 'POST', path: '/api/players/:id/reward-shop/purchase',
    title: 'Purchase a shop item (spend tokens)', auth: 'client',
    summary:
      'Spend a player’s tokens on a reward-shop product. Atomic: gamru re-reads the live balance + stock, validates affordability, then deducts tokens, decrements stock and writes the audit in one transaction (no double-spend). The trusted price/stock come from gamru — you only name the product and quantity.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true, desc: 'player id' }] },
    body: { fields: [
      { name: 'shop_item_id', type: 'uuid', required: true, desc: 'id from gamification.reward_shop' },
      { name: 'quantity', type: 'number', required: false, desc: '1–99, default 1' },
    ]},
    response: { status: 200, example: j({ success: true, data: { item_name: 'XP Booster', tokens_spent: 100, tokens_remaining: 220, stock_available: 24 } }) },
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
    id: 'gamru-campaigns-get',
    platform: 'gamru', group: 'CRM — Campaigns', method: 'GET', path: '/api/campaigns/:id',
    title: 'Get campaign', auth: 'jwt',
    summary: 'Fetch one campaign with its channel, template, segment and trigger config.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, data: { id: 'uuid', name: 'Welcome series', status: 'SCHEDULED', channel: 'ON_SITE', template_id: 'tpl1', trigger: 'Event: Registration' } }) },
  },
  {
    id: 'gamru-campaigns-update',
    platform: 'gamru', group: 'CRM — Campaigns', method: 'POST', path: '/api/campaigns/update-by/:id',
    title: 'Update campaign', auth: 'jwt',
    summary: 'Edit a campaign — its channel, template, segment, trigger or schedule. An event campaign only delivers once it has BOTH a template_id and a matching segment.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, data: { id: 'uuid', name: 'Welcome series (v2)' } }) },
  },
  {
    id: 'gamru-campaigns-send',
    platform: 'gamru', group: 'CRM — Campaigns', method: 'POST', path: '/api/campaigns/send/:id',
    title: 'Send campaign now', auth: 'jwt',
    summary:
      'Execute the campaign immediately: resolve its segment to real players, render the template (tokens like {{name}}), enforce consent + frequency caps + unsubscribes, write each player’s on-site inbox row and record SENT / DELIVERED analytics. This is the manual counterpart to the event trigger (POST /api/integration/events).',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Campaign sent', data: { campaign_id: 'uuid', recipients: 128, delivered: 124, suppressed: 4 } }) },
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
    id: 'gamru-campaigns-delete',
    platform: 'gamru', group: 'CRM — Campaigns', method: 'DELETE', path: '/api/campaigns/:id',
    title: 'Delete campaign', auth: 'jwt',
    summary: 'Permanently remove a campaign. Prefer archive when you only want to take it offline — delete is irreversible.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Campaign deleted successfully', data: null }) },
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

  // ---- Widgets: public (embed) surface ----
  {
    id: 'gamru-widget-validate',
    platform: 'gamru', group: 'Widgets', method: 'GET', path: '/api/widget/validate',
    title: 'Validate a widget', auth: 'client',
    summary: 'Public route called from INSIDE the embedded iframe before it renders. Verifies the auth key, optional clientId, the widget type, and (if a config exists for that client+type) its status / expiry / allowed_domains. The auth key may be sent as ?authKey= or the x-client-auth-key header.',
    query: { fields: [
      { name: 'authKey', type: 'string', required: true, desc: 'client auth_key (or x-client-auth-key header)' },
      { name: 'clientId', type: 'string', required: false, desc: 'slug / skin_id / id' },
      { name: 'type', type: 'string', required: false, desc: 'widget type being rendered' },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Widget validated', data: { validated: true, widget_type: 'mission', widget_config_id: 'uuid', appearance: { theme: 'dark', accent_color: '#7c5cff' } } }) },
  },
  {
    id: 'gamru-widget-list',
    platform: 'gamru', group: 'Widgets', method: 'GET', path: '/api/widget/list',
    title: 'List a client’s active widgets', auth: 'client',
    summary: 'Public route the embedding site calls to discover which widgets the operator turned ON. Returns the client’s ACTIVE widget configs so the page can render exactly those (the “create-driven” Widgets tab). CORS is open.',
    query: { fields: [
      { name: 'authKey', type: 'string', required: true, desc: 'client auth_key (or x-client-auth-key header)' },
      { name: 'clientId', type: 'string', required: false },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Widgets fetched successfully', data: [{ id: 'uuid', type: 'points', name: 'Header stats', appearance: {} }, { id: 'uuid', type: 'mission', name: 'Missions board', appearance: {} }] }) },
  },

  // ---- Widgets: admin CRUD (widget_configurations) ----
  {
    id: 'gamru-widget-configs-list',
    platform: 'gamru', group: 'Widgets', method: 'GET', path: '/api/widget/configurations',
    title: 'List widget configurations', auth: 'admin',
    summary: 'Paginated list of the widgets created in Settings → Widget / iFrame Setup, filterable by client, type and status.',
    query: { fields: [
      { name: 'page / limit', type: 'number', desc: 'default 1 / 10 (max 100)' },
      { name: 'search', type: 'string' },
      { name: 'status', type: "'ACTIVE' | 'INACTIVE'" },
      { name: 'type', type: 'string' },
      { name: 'client_id', type: 'uuid' },
    ]},
    response: { status: 200, example: j({ success: true, data: [{ id: 'uuid', client_id: 'uuid', name: 'Missions board', type: 'mission', status: 'ACTIVE' }], pagination: { total: 1, page: 1, limit: 10, totalPages: 1 } }) },
  },
  {
    id: 'gamru-widget-configs-create',
    platform: 'gamru', group: 'Widgets', method: 'POST', path: '/api/widget/configurations',
    title: 'Create a widget', auth: 'admin',
    summary: 'Create an embeddable widget for a client + type. status, expiry_date and allowed_domains control access; appearance holds the full look-and-feel (theme, colours, layout, size).',
    body: { fields: [
      { name: 'client_id', type: 'uuid', required: true },
      { name: 'name', type: 'string', required: true, desc: '2–120 chars' },
      { name: 'type', type: 'enum', required: true, desc: 'mission | tournament | reward-shop | rewards | campaign | rankings | profile | status | progress | points | avatar | tokens | badge-level' },
      { name: 'status', type: "'ACTIVE' | 'INACTIVE'", required: false, desc: 'default ACTIVE' },
      { name: 'expiry_date', type: 'ISO date | null', required: false },
      { name: 'allowed_domains', type: 'string[] | null', required: false },
      { name: 'appearance', type: 'object | null', required: false, desc: 'theme, accent_color, colours, radius, spacing, layout, align, width, size, mobile…' },
    ]},
    response: { status: 201, example: j({ success: true, message: 'Widget created successfully', data: { id: 'uuid', client_id: 'uuid', name: 'Missions board', type: 'mission', status: 'ACTIVE' } }) },
  },
  {
    id: 'gamru-widget-configs-update',
    platform: 'gamru', group: 'Widgets', method: 'POST', path: '/api/widget/configurations/:id',
    title: 'Update a widget', auth: 'admin',
    summary: 'Patch any field of a widget configuration (name, type, status, expiry, allowed_domains, appearance). At least one field required.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Widget updated successfully', data: { id: 'uuid', name: 'Missions board (v2)' } }) },
  },
  {
    id: 'gamru-widget-configs-toggle',
    platform: 'gamru', group: 'Widgets', method: 'POST', path: '/api/widget/configurations/:id/toggle-status',
    title: 'Toggle widget status', auth: 'admin',
    summary: 'Flip a widget between ACTIVE and INACTIVE. An INACTIVE widget fails validation, so it stops rendering everywhere it’s embedded.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Widget status updated', data: { id: 'uuid', status: 'INACTIVE' } }) },
  },
  {
    id: 'gamru-widget-configs-delete',
    platform: 'gamru', group: 'Widgets', method: 'DELETE', path: '/api/widget/configurations/:id',
    title: 'Delete a widget', auth: 'admin',
    summary: 'Permanently remove a widget configuration. Existing embeds fall back to client-level domain rules (or stop validating if none).',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Widget deleted successfully', data: null }) },
  },

  // =========================================================================
  // INTEGRATION API — GAMRU is the single source of truth for mission &
  // tournament PROGRESS. The games platform calls these (x-client-auth-key);
  // GAMRU computes join / progress / completion / ranking / settlement / claim
  // and returns the snapshot. The player is resolved by `email` (body for POST,
  // query for GET); `/users/:userId/*` also accepts your user id as external_id.
  // =========================================================================

  // ----  Missions (player progress) ----
  {
    id: 'gamru-int-missions-list',
    platform: 'gamru', group: ' Missions', method: 'GET', path: '/api/missions',
    title: 'List missions with progress', auth: 'client',
    summary: 'Every active mission with this player’s GAMRU-computed status & progress merged in (AVAILABLE → IN_PROGRESS → COMPLETED → CLAIMED). Replaces reading the missions slice of by-email when you want the live progress directly.',
    query: { fields: [{ name: 'email', type: 'string', required: true, desc: 'the player' }] },
    response: { status: 200, example: j({ success: true, message: 'Missions fetched', data: { missions: [{ id: 'm1', name: 'Spin 10 slots', status: 'IN_PROGRESS', progress: 4, target: 10, reward_label: '10 Bonus Cash', completed_at: null, claimed_at: null }] } }) },
  },
  {
    id: 'gamru-int-missions-get',
    platform: 'gamru', group: ' Missions', method: 'GET', path: '/api/missions/:id',
    title: 'Get one mission (with progress)', auth: 'client',
    summary: 'One mission with the player’s progress. Pass ?bundleId= to read the mission on a bundle’s independent track.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true, desc: 'mission id' }] },
    query: { fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'bundleId', type: 'uuid', required: false, desc: 'read on this bundle’s track' },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Mission fetched', data: { id: 'm1', name: 'Spin 10 slots', status: 'IN_PROGRESS', progress: 4, target: 10 } }) },
  },
  {
    id: 'gamru-int-missions-join',
    platform: 'gamru', group: ' Missions', method: 'POST', path: '/api/missions/:id/join',
    title: 'Join a mission', auth: 'client',
    summary: 'Start a mission for the player. On the standalone track GAMRU enforces one IN_PROGRESS mission per bucket (Casino / Sport) — joining another in the same bucket cancels the current one. Pass bundleId to join on that bundle’s independent (non-exclusive) track.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true, desc: 'mission id' }] },
    body: { fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'external_id', type: 'string', required: false, desc: 'your platform’s user id' },
      { name: 'bundleId', type: 'uuid', required: false, desc: 'join on a bundle track' },
    ]},
    bodyExample: { email: 'jane@x.com', external_id: 'P-1001' },
    response: { status: 200, example: j({ success: true, message: 'Mission joined', data: { id: 'm1', status: 'IN_PROGRESS', progress: 0, target: 10 } }) },
  },
  {
    id: 'gamru-int-missions-cancel',
    platform: 'gamru', group: ' Missions', method: 'POST', path: '/api/missions/:id/cancel',
    title: 'Cancel a mission', auth: 'client',
    summary: 'Abandon a running mission (its progress row is removed; the mission returns to AVAILABLE). A CLAIMED mission cannot be cancelled.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    body: { fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'bundleId', type: 'uuid', required: false },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Mission cancelled', data: { cancelled: true } }) },
  },
  {
    id: 'gamru-int-missions-progress-get',
    platform: 'gamru', group: ' Missions', method: 'GET', path: '/api/missions/:id/progress',
    title: 'Get mission progress', auth: 'client',
    summary: 'The player’s current progress for one mission (same shape as get-one). Pass ?bundleId= for a bundle track.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    query: { fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'bundleId', type: 'uuid', required: false },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Mission progress fetched', data: { id: 'm1', status: 'IN_PROGRESS', progress: 4, target: 10 } }) },
  },
  {
    id: 'gamru-int-missions-progress-post',
    platform: 'gamru', group: ' Missions', method: 'POST', path: '/api/missions/:id/progress',
    title: 'Advance mission from a play', auth: 'client',
    summary: 'Forward one gameplay event scoped to this mission; GAMRU advances the objective (wager / bet_count / win) and completes it when the target is reached, then returns the updated mission. The broader /activity hook does the same across all of the player’s missions at once.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    body: { fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'stake', type: 'number', required: false, desc: 'bet / turnover for this play' },
      { name: 'win', type: 'boolean', required: false },
      { name: 'winAmount', type: 'number', required: false, desc: 'amount won (for win objectives)' },
      { name: 'gameKey', type: 'string', required: false, desc: 'game played (gates game-restricted missions)' },
      { name: 'bundleId', type: 'uuid', required: false },
    ]},
    bodyExample: { email: 'jane@x.com', stake: 5, win: true, winAmount: 12, gameKey: 'aviator' },
    response: { status: 200, example: j({ success: true, message: 'Mission progress updated', data: { id: 'm1', status: 'IN_PROGRESS', progress: 5, target: 10 } }) },
  },
  {
    id: 'gamru-int-missions-claim',
    platform: 'gamru', group: ' Missions', method: 'POST', path: '/api/missions/:id/claim',
    title: 'Claim a mission reward', auth: 'client',
    summary: 'Claim a COMPLETED mission. GAMRU grants the mission’s reward (from its trusted definition) into the player’s reward ledger and flips the mission to CLAIMED. Pass bundleId to claim on a bundle track.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    body: { fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'bundleId', type: 'uuid', required: false },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Mission reward claimed', data: { reward_label: '10 Bonus Cash', mission: { id: 'm1', status: 'CLAIMED' } } }) },
  },

  // ----  Mission bundles (player progress) ----
  {
    id: 'gamru-int-bundles-list',
    platform: 'gamru', group: ' Mission Bundles', method: 'GET', path: '/api/mission-bundles',
    title: 'List eligible bundles with progress', auth: 'client',
    summary: 'Every active mission bundle this player is ELIGIBLE for (segment-gated), each with its grouped member missions and the player’s per-bundle-track progress merged in (independent of the standalone Missions tab and of other bundles). completed/total is the bundle’s overall progress. A bundle carries no reward of its own — the player joins / progresses / claims each member mission individually (pass bundleId on the mission endpoints).',
    query: { fields: [{ name: 'email', type: 'string', required: true, desc: 'the player' }] },
    response: { status: 200, example: j({ success: true, message: 'Mission bundles fetched', data: { bundles: [{ id: 'b1', name: 'Weekend Grind', periodicity: 'WEEKLY', bundle_type: 'Custom', eligibility_type: 'All Players', segments: [], completed: 0, total: 2, missions: [{ id: 'm1', name: 'Spin 10 slots', status: 'IN_PROGRESS', progress: 4, target: 10, reward_label: '10 Bonus Cash' }] }] } }) },
  },
  {
    id: 'gamru-int-bundles-get',
    platform: 'gamru', group: ' Mission Bundles', method: 'GET', path: '/api/mission-bundles/:id',
    title: 'Get one bundle (with progress)', auth: 'client',
    summary: 'One bundle with its grouped missions and the player’s per-bundle-track progress. 404 if the bundle is archived/inactive or the player is not eligible for it.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true, desc: 'mission-bundle id' }] },
    query: { fields: [{ name: 'email', type: 'string', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Mission bundle fetched', data: { id: 'b1', name: 'Weekend Grind', periodicity: 'WEEKLY', bundle_type: 'Custom', completed: 0, total: 2, missions: [{ id: 'm1', name: 'Spin 10 slots', status: 'IN_PROGRESS', progress: 4, target: 10 }] } }) },
  },
  {
    id: 'gamru-int-bundles-mission-join',
    platform: 'gamru', group: ' Mission Bundles', method: 'POST', path: '/api/mission-bundles/:id/missions/:missionId/join',
    title: 'Join a mission inside a bundle', auth: 'client',
    summary: 'Start one of the bundle’s missions on the bundle’s OWN track (its per-bundle period_key). No one-per-bucket exclusivity here — every mission in the bundle can run at once, and progress is independent of the same mission on the standalone Missions tab or in another bundle. Also bumps the operator console’s bundle “Participated” count.',
    params: { fields: [
      { name: 'id', type: 'uuid', required: true, desc: 'mission-bundle id' },
      { name: 'missionId', type: 'uuid', required: true, desc: 'a mission grouped in the bundle' },
    ]},
    body: { fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'external_id', type: 'string', required: false, desc: 'your platform’s user id' },
    ]},
    bodyExample: { email: 'jane@x.com', external_id: 'P-1001' },
    response: { status: 200, example: j({ success: true, message: 'Bundle mission joined', data: { id: 'm1', status: 'IN_PROGRESS', progress: 0, target: 10 } }) },
  },
  {
    id: 'gamru-int-bundles-mission-cancel',
    platform: 'gamru', group: ' Mission Bundles', method: 'POST', path: '/api/mission-bundles/:id/missions/:missionId/cancel',
    title: 'Cancel a mission inside a bundle', auth: 'client',
    summary: 'Abandon a running bundle mission on the bundle’s track (its progress row is removed; the mission returns to AVAILABLE for that bundle). A CLAIMED mission cannot be cancelled.',
    params: { fields: [
      { name: 'id', type: 'uuid', required: true, desc: 'mission-bundle id' },
      { name: 'missionId', type: 'uuid', required: true },
    ]},
    body: { fields: [{ name: 'email', type: 'string', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Bundle mission cancelled', data: { cancelled: true } }) },
  },
  {
    id: 'gamru-int-bundles-mission-progress-get',
    platform: 'gamru', group: ' Mission Bundles', method: 'GET', path: '/api/mission-bundles/:id/missions/:missionId/progress',
    title: 'Get a bundle mission’s progress', auth: 'client',
    summary: 'The player’s progress for one mission on this bundle’s track (same shape as a standalone mission).',
    params: { fields: [
      { name: 'id', type: 'uuid', required: true, desc: 'mission-bundle id' },
      { name: 'missionId', type: 'uuid', required: true },
    ]},
    query: { fields: [{ name: 'email', type: 'string', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Bundle mission progress fetched', data: { id: 'm1', status: 'IN_PROGRESS', progress: 4, target: 10 } }) },
  },
  {
    id: 'gamru-int-bundles-mission-progress-post',
    platform: 'gamru', group: ' Mission Bundles', method: 'POST', path: '/api/mission-bundles/:id/missions/:missionId/progress',
    title: 'Advance a bundle mission from a play', auth: 'client',
    summary: 'Forward one gameplay event scoped to a mission on this bundle’s track; GAMRU advances the objective (wager / bet_count / win), completes it at target, and returns the updated mission.',
    params: { fields: [
      { name: 'id', type: 'uuid', required: true, desc: 'mission-bundle id' },
      { name: 'missionId', type: 'uuid', required: true },
    ]},
    body: { fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'stake', type: 'number', required: false, desc: 'bet / turnover for this play' },
      { name: 'win', type: 'boolean', required: false },
      { name: 'winAmount', type: 'number', required: false },
      { name: 'gameKey', type: 'string', required: false, desc: 'gates game-restricted missions' },
    ]},
    bodyExample: { email: 'jane@x.com', stake: 5, win: true, winAmount: 12, gameKey: 'aviator' },
    response: { status: 200, example: j({ success: true, message: 'Bundle mission progress updated', data: { id: 'm1', status: 'IN_PROGRESS', progress: 5, target: 10 } }) },
  },
  {
    id: 'gamru-int-bundles-mission-claim',
    platform: 'gamru', group: ' Mission Bundles', method: 'POST', path: '/api/mission-bundles/:id/missions/:missionId/claim',
    title: 'Claim a bundle mission reward', auth: 'client',
    summary: 'Claim a COMPLETED mission on this bundle’s track. GAMRU grants the mission’s reward into the player’s ledger and flips it to CLAIMED, then bumps the operator console’s bundle “Participated” count.',
    params: { fields: [
      { name: 'id', type: 'uuid', required: true, desc: 'mission-bundle id' },
      { name: 'missionId', type: 'uuid', required: true },
    ]},
    body: { fields: [{ name: 'email', type: 'string', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Bundle mission reward claimed', data: { reward_label: '10 Bonus Cash', mission: { id: 'm1', status: 'CLAIMED' } } }) },
  },

  // ----  Tournaments (player progress) ----
  {
    id: 'gamru-int-tournaments-list',
    platform: 'gamru', group: ' Tournaments', method: 'GET', path: '/api/tournaments',
    title: 'List tournaments', auth: 'client',
    summary: 'All active tournaments with their lifecycle state (SCHEDULED / IN_PROGRESS / ENDED). Opening this also lazily settles any tournament that has ended.',
    query: { fields: [{ name: 'email', type: 'string', required: false }] },
    response: { status: 200, example: j({ success: true, message: 'Tournaments fetched', data: { tournaments: [{ id: 't1', name: 'Weekend Race', state: 'IN_PROGRESS', prize_pool: 1000, games: ['aviator'] }] } }) },
  },
  {
    id: 'gamru-int-tournaments-get',
    platform: 'gamru', group: ' Tournaments', method: 'GET', path: '/api/tournaments/:id',
    title: 'Get tournament + leaderboard', auth: 'client',
    summary: 'One tournament plus its ranked leaderboard (the requesting player is flagged is_me). If the tournament has ended it is settled first, so prizes show.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    query: { fields: [{ name: 'email', type: 'string', required: false, desc: 'flags is_me on the board' }] },
    response: { status: 200, example: j({ success: true, message: 'Tournament fetched', data: { tournament: { id: 't1', name: 'Weekend Race', state: 'ENDED' }, leaderboard: [{ rank: 1, email: 'jane@x.com', name: 'Jane', score: 4200, is_me: true, prize: 500, claimed: false }] } }) },
  },
  {
    id: 'gamru-int-tournaments-join',
    platform: 'gamru', group: ' Tournaments', method: 'POST', path: '/api/tournaments/:id/join',
    title: 'Join a tournament', auth: 'client',
    summary: 'Register the player for a tournament (creates their standings row, marks opted_in for buy-in tournaments). Scoring also auto-registers, so this is optional — use it for an explicit “Enter” button.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    body: { fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'external_id', type: 'string', required: false },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Tournament joined', data: { tournament_id: 't1', registered: true, score: 0, status: 'REGISTERED' } }) },
  },
  {
    id: 'gamru-int-tournaments-progress',
    platform: 'gamru', group: ' Tournaments', method: 'GET', path: '/api/tournaments/:id/progress',
    title: 'Get tournament progress', auth: 'client',
    summary: 'The player’s standing in one tournament: live rank, score, plays, and prize / claim status once it has settled.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    query: { fields: [{ name: 'email', type: 'string', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Tournament progress fetched', data: { tournament_id: 't1', registered: true, score: 3900, plays: 12, rank: 2, prize_amount: 0, prize_awarded: false, claimed: false, status: 'REGISTERED' } }) },
  },
  {
    id: 'gamru-int-tournaments-leaderboard',
    platform: 'gamru', group: ' Tournaments', method: 'GET', path: '/api/tournaments/:id/leaderboard',
    title: 'Get tournament leaderboard', auth: 'client',
    summary: 'The ranked standings for a tournament (score DESC). Pass ?email= to flag the requesting player, and ?size= to cap rows.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    query: { fields: [
      { name: 'email', type: 'string', required: false },
      { name: 'size', type: 'number', required: false, desc: 'max rows' },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Leaderboard fetched', data: { leaderboard: [{ rank: 1, email: 'a@x.com', name: 'Ace', score: 4200, is_me: false, prize: 0, claimed: false }] } }) },
  },
  {
    id: 'gamru-int-tournaments-score',
    platform: 'gamru', group: ' Tournaments', method: 'POST', path: '/api/tournaments/:id/score',
    title: 'Submit a tournament score', auth: 'client',
    summary: 'Add points the player earned this play. GAMRU accumulates the score, tracks plays/games, and ignores plays of games not in the tournament. Sending it the first time also registers the player.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    body: { fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'points', type: 'number', required: true, desc: 'points to ADD' },
      { name: 'game', type: 'string', required: false, desc: 'game key played' },
      { name: 'external_id', type: 'string', required: false },
    ]},
    bodyExample: { email: 'jane@x.com', points: 150, game: 'aviator' },
    response: { status: 200, example: j({ success: true, message: 'Score recorded', data: { tournament_id: 't1', score: 4050, applied: 150 } }) },
  },
  {
    id: 'gamru-int-tournaments-claim',
    platform: 'gamru', group: ' Tournaments', method: 'POST', path: '/api/tournaments/:id/claim',
    title: 'Claim a tournament prize', auth: 'client',
    summary: 'Claim the player’s settled prize. On end GAMRU ranks the top-3 (50 / 30 / 20 of the pool) and creates an IN_PROGRESS reward for each winner — so the prize also shows in the player’s rewards, claimable there. This endpoint resolves to that same reward (claim from the tournament page OR the rewards table — granted exactly once) and marks the standing CLAIMED.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true }] },
    body: { fields: [{ name: 'email', type: 'string', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Tournament prize claimed', data: { prize: 500 } }) },
  },

  // ----  User progress (aggregate) ----
  {
    id: 'gamru-int-user-missions',
    platform: 'gamru', group: ' User progress', method: 'GET', path: '/api/users/:userId/missions',
    title: 'All of a user’s missions', auth: 'client',
    summary: 'Every mission the player has participated in (all tracks), with progress & status. userId is your platform’s user id (external_id); also pass ?email= to resolve directly.',
    params: { fields: [{ name: 'userId', type: 'string', required: true, desc: 'your user id / external_id' }] },
    query: { fields: [{ name: 'email', type: 'string', required: false }] },
    response: { status: 200, example: j({ success: true, message: 'User missions fetched', data: { missions: [{ id: 'm1', name: 'Spin 10 slots', status: 'CLAIMED', progress: 10, target: 10 }] } }) },
  },
  {
    id: 'gamru-int-user-tournaments',
    platform: 'gamru', group: ' User progress', method: 'GET', path: '/api/users/:userId/tournaments',
    title: 'A user’s tournament history', auth: 'client',
    summary: 'Every tournament the player has taken part in, with games played, score, rank, prize and claim status.',
    params: { fields: [{ name: 'userId', type: 'string', required: true }] },
    query: { fields: [{ name: 'email', type: 'string', required: false }] },
    response: { status: 200, example: j({ success: true, message: 'User tournaments fetched', data: { tournaments: [{ tournament_id: 't1', name: 'Weekend Race', industry: 'Casino', plays: 12, xp: 3900, rank: 2, prize: 0, claimed: false }] } }) },
  },
  {
    id: 'gamru-int-user-progress',
    platform: 'gamru', group: ' User progress', method: 'GET', path: '/api/users/:userId/progress',
    title: 'A user’s full progress', auth: 'client',
    summary: 'Missions + tournaments progress in one call — convenient for a player “progress” screen.',
    params: { fields: [{ name: 'userId', type: 'string', required: true }] },
    query: { fields: [{ name: 'email', type: 'string', required: false }] },
    response: { status: 200, example: j({ success: true, message: 'User progress fetched', data: { missions: [], tournaments: [] } }) },
  },
  {
    id: 'gamru-int-user-rewards',
    platform: 'gamru', group: ' User progress', method: 'GET', path: '/api/users/:userId/rewards',
    title: 'A user’s rewards', auth: 'client',
    summary: 'Every reward the player has earned, any status (mission, tournament, rank, reward-shop, manual).',
    params: { fields: [{ name: 'userId', type: 'string', required: true }] },
    query: { fields: [{ name: 'email', type: 'string', required: false }] },
    response: { status: 200, example: j({ success: true, message: 'Rewards fetched', data: { rewards: [{ id: 'r1', gamification_source: 'tournaments', reward_type: 'bonus_cash', reward: 'Weekend Race prize — 500', status: 'GRANTED' }] } }) },
  },
  {
    id: 'gamru-int-user-claims',
    platform: 'gamru', group: ' User progress', method: 'GET', path: '/api/users/:userId/claims',
    title: 'A user’s claimed rewards', auth: 'client',
    summary: 'Only the rewards the player has actually claimed (status GRANTED).',
    params: { fields: [{ name: 'userId', type: 'string', required: true }] },
    query: { fields: [{ name: 'email', type: 'string', required: false }] },
    response: { status: 200, example: j({ success: true, message: 'Claims fetched', data: { claims: [{ id: 'r1', reward_type: 'bonus_cash', reward: 'Weekend Race prize — 500', status: 'GRANTED', granted_date: '2026-06-18T12:00:00Z' }] } }) },
  },
  {
    id: 'gamru-int-activity',
    platform: 'gamru', group: ' User progress', method: 'POST', path: '/api/activity',
    title: 'Forward a gameplay / login event', auth: 'client',
    summary: 'The single ingress for progression: forward a play (or login) and GAMRU advances every relevant mission and, when a tournament + points are supplied, the tournament score. Returns the player’s fresh mission snapshot to cache. kind defaults to "play"; send kind:"login" to tick login missions.',
    body: { fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'external_id', type: 'string', required: false },
      { name: 'kind', type: "'play' | 'login'", required: false, desc: 'default play' },
      { name: 'stake', type: 'number', required: false },
      { name: 'win', type: 'boolean', required: false },
      { name: 'winAmount', type: 'number', required: false },
      { name: 'gameKey', type: 'string', required: false },
      { name: 'missionId', type: 'uuid', required: false, desc: 'scope to a mission launched from a card' },
      { name: 'bundleId', type: 'uuid', required: false, desc: 'scope to a bundle track' },
      { name: 'tournamentId', type: 'uuid', required: false, desc: 'also score this tournament' },
      { name: 'points', type: 'number', required: false, desc: 'tournament points for this play' },
    ]},
    bodyExample: { email: 'jane@x.com', kind: 'play', stake: 5, win: true, winAmount: 12, gameKey: 'aviator', tournamentId: 't1', points: 150 },
    response: { status: 200, example: j({ success: true, message: 'Activity processed', data: { missions: [{ id: 'm1', status: 'IN_PROGRESS', progress: 5, target: 10 }] } }) },
  },

  // ---- Campaign inbox (player surface — the READ side of campaign delivery) ----
  // Campaigns are authored by operators (CRM, admin) and delivered to the
  // player's on-site inbox. The games platform reads/acks them over the client
  // key, resolving the player by email — exactly like the mission/tournament
  // integration surface above. GAMRU owns rendering, consent and analytics.
  {
    id: 'gamru-int-inbox-list',
    platform: 'gamru', group: ' Inbox', method: 'POST', path: '/api/inbox/list',
    title: 'List the player’s inbox', auth: 'client',
    summary:
      'The player’s delivered campaign messages plus the unread badge count. POST so the email travels in the body (same contract as /players/by-email). Poll it (or refresh on focus) to keep the badge live; pass unread_only to fetch just the unseen ones.',
    body: { fields: [
      { name: 'email', type: 'string', required: true, desc: 'the player' },
      { name: 'page / limit', type: 'number', required: false, desc: 'default 1 / 20 (limit capped at 100)' },
      { name: 'unread_only', type: 'boolean', required: false, desc: 'only messages not yet read' },
    ]},
    bodyExample: { email: 'jane@x.com', page: 1, limit: 20, unread_only: false },
    response: { status: 200, example: j({ success: true, message: 'Inbox fetched successfully', data: { unread_count: 2, items: [{ id: 'd1', campaign_id: 'c1', channel: 'ON_SITE', title: 'Welcome bonus', body: 'Hi Jane, here’s 50 free spins…', status: 'DELIVERED', read: false, event_label: 'Event: Registration', event_at: '2026-06-20T10:00:00Z', read_at: null }], pagination: { total: 2, page: 1, limit: 20, totalPages: 1 } } }) },
  },
  {
    id: 'gamru-int-inbox-read',
    platform: 'gamru', group: ' Inbox', method: 'POST', path: '/api/inbox/:id/read',
    title: 'Mark a message read', auth: 'client',
    summary:
      'Mark one delivered message opened when the player views it. GAMRU stamps read_at and records a real OPEN engagement event against the campaign’s analytics. id is the delivery id from the inbox list.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true, desc: 'delivery id from the inbox list' }] },
    body: { fields: [{ name: 'email', type: 'string', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Message marked as read', data: { id: 'd1', status: 'OPEN', read: true, read_at: '2026-06-20T10:05:00Z' } }) },
  },
  {
    id: 'gamru-int-inbox-click',
    platform: 'gamru', group: ' Inbox', method: 'POST', path: '/api/inbox/:id/click',
    title: 'Record a message click', auth: 'client',
    summary:
      'Record the player tapping the message’s CTA. GAMRU marks it read (if not already) and records a real CLICK engagement event for the campaign’s analytics funnel.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true, desc: 'delivery id from the inbox list' }] },
    body: { fields: [{ name: 'email', type: 'string', required: true }] },
    response: { status: 200, example: j({ success: true, message: 'Message click recorded', data: { id: 'd1', status: 'CLICKED', read: true } }) },
  },
  {
    id: 'gamru-int-inbox-unsubscribe',
    platform: 'gamru', group: ' Inbox', method: 'POST', path: '/api/inbox/unsubscribe',
    title: 'Unsubscribe from a channel', auth: 'client',
    summary:
      'Opt the player out of a channel. GAMRU flips the matching consent flag off (so future deliveries on that channel are suppressed) and writes an unsubscribe report for the operator audit. Defaults to the ON_SITE channel.',
    body: { fields: [
      { name: 'email', type: 'string', required: true },
      { name: 'channel', type: "'ON_SITE' | 'EMAIL' | 'SMS' | 'WEB_PUSH' | 'PUSH'", required: false, desc: 'default ON_SITE' },
      { name: 'reason', type: 'string', required: false, desc: 'free-text opt-out reason' },
      { name: 'campaign_name', type: 'string', required: false, desc: 'the campaign that prompted it' },
    ]},
    bodyExample: { email: 'jane@x.com', channel: 'EMAIL', reason: 'Too many emails' },
    response: { status: 200, example: j({ success: true, message: 'Unsubscribed successfully', data: { unsubscribed: true, channel: 'EMAIL' } }) },
  },

  // ---- Per-player progress (operator console — admin JWT) ----
  {
    id: 'gamru-players-missions',
    platform: 'gamru', group: 'Players', method: 'GET', path: '/api/players/:id/missions',
    title: 'Player mission progress', auth: 'jwt',
    summary: 'Operator view of one player’s mission progress (the Gamification tab’s Missions section) — status, progress/target, completed & claimed timestamps. Reads the same GAMRU progress the games platform consumes via /api/integration.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true, desc: 'player id' }] },
    response: { status: 200, example: j({ success: true, message: 'Player missions fetched successfully', data: { missions: [{ id: 'm1', name: 'Spin 10 slots', status: 'COMPLETED', progress: 10, target: 10, reward_label: '10 Bonus Cash', completed_at: '2026-06-18T10:00:00Z', claimed_at: null }] } }) },
  },
  {
    id: 'gamru-players-tournaments',
    platform: 'gamru', group: 'Players', method: 'GET', path: '/api/players/:id/tournaments',
    title: 'Player tournament standings', auth: 'jwt',
    summary: 'Operator view of one player’s tournament standings & prizes (the Gamification tab’s Tournaments section) — rank, score, plays, prize and claim status.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true, desc: 'player id' }] },
    response: { status: 200, example: j({ success: true, message: 'Player tournaments fetched successfully', data: { tournaments: [{ tournament_id: 't1', name: 'Weekend Race', industry: 'Casino', plays: 12, xp: 3900, rank: 2, prize: 0, claimed: false, last_played_at: '2026-06-18T10:00:00Z' }] } }) },
  },
  {
    id: 'gamru-players-bundles',
    platform: 'gamru', group: 'Players', method: 'GET', path: '/api/players/:id/bundles',
    title: 'Player mission-bundle progress', auth: 'jwt',
    summary: 'Operator view of one player’s mission bundles (the Gamification tab’s Mission Bundles section), grouped per bundle: the bundle’s overall completed/total plus each member mission’s per-bundle-track progress. Only bundles the player has joined into are returned.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true, desc: 'player id' }] },
    response: { status: 200, example: j({ success: true, message: 'Player mission bundles fetched successfully', data: { bundles: [{ id: 'b1', name: 'bundle mission 1', periodicity: 'WEEKLY', bundle_type: 'Custom', completed: 0, total: 2, missions: [{ id: 'm1', name: 'mission1', status: 'IN_PROGRESS', progress: 2, target: 6, reward_label: 'test get 134 token' }] }] } }) },
  },

  // ---- Bonuses (rank/level bonus mirror) ----
  // Bonuses are DEFINED on the games platform and PINNED to a GAMRU rank/level
  // (data.levels[].bonus_ids / data.bonus_ids). On rank save GAMRU snapshots the
  // definition into `bonuses`; when a player claims on the games platform the
  // claim is mirrored into `user_bonuses`. The operator views both here; the
  // games platform writes claims via the S2S record endpoint.
  {
    id: 'gamru-bonuses-list',
    platform: 'gamru', group: 'Bonuses', method: 'GET', path: '/api/bonuses',
    title: 'List synced bonuses', auth: 'jwt',
    summary: 'Operator view of the Games platform bonus definitions GAMRU has snapshotted (one row per external bonus id pinned on a rank/level). Each carries a `source` (Games platform). Supports search across name / type / source / bonus id.',
    query: { fields: [
      { name: 'page', type: 'number', required: false, desc: 'default 1' },
      { name: 'limit', type: 'number', required: false, desc: 'default 25' },
      { name: 'search', type: 'string', required: false, desc: 'case-insensitive match on bonus_name / bonus_type / external_bonus_id / source' },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Bonuses fetched successfully', data: { data: [{ id: 'uuid', external_bonus_id: 'b0000001-0000-4000-8000-000000000003', bonus_name: 'Rank Reward', bonus_type: 'BONUS_CASH', amount: 1000, amount_type: 'BM', status: 'ACTIVE', source: 'Games platform', synced_at: '2026-06-23T09:00:00Z' }], pagination: { total: 3, page: 1, limit: 25, totalPages: 1 } } }) },
  },
  {
    id: 'gamru-user-bonuses-list',
    platform: 'gamru', group: 'Bonuses', method: 'GET', path: '/api/user-bonuses',
    title: 'List claimed user bonuses', auth: 'jwt',
    summary: 'Operator view of the claimed-bonus ledger mirror — one row per bonus a player claimed on the games platform. `source_type` is LEVEL/RANK (with source_id) and `source` is the origin platform (Games platform). Supports search across user / bonus / source. This is an audit mirror; the wallet credit itself stays on the games platform.',
    query: { fields: [
      { name: 'page', type: 'number', required: false, desc: 'default 1' },
      { name: 'limit', type: 'number', required: false, desc: 'default 25' },
      { name: 'search', type: 'string', required: false, desc: 'match on email / user_id / bonus_name / external_bonus_id / source_type / source' },
    ]},
    response: { status: 200, example: j({ success: true, message: 'User bonuses fetched successfully', data: { data: [{ id: 'uuid', user_id: 'U-1', email: 'player@brand.com', external_bonus_id: 'b0000001-0000-4000-8000-000000000002', bonus_name: 'Level Reward', source_type: 'LEVEL', source_id: '12', amount: 500, amount_type: 'RM', status: 'CLAIMED', source: 'Games platform', claimed_at: '2026-06-23T09:05:00Z' }], pagination: { total: 1, page: 1, limit: 25, totalPages: 1 } } }) },
  },
  {
    id: 'gamru-user-bonuses-record',
    platform: 'gamru', group: 'Bonuses', method: 'POST', path: '/api/user-bonuses/record',
    title: 'Record a bonus claim (S2S)', auth: 'client',
    summary: 'Called by the games platform (fire-and-forget) after a player claims a bonus, to mirror the claim into GAMRU’s user_bonuses ledger. GAMRU also upserts the bonus snapshot from the same payload, so the Bonuses table stays populated even if the rank-sync never ran. The player is identified by email (+ external_id).',
    body: { fields: [
      { name: 'external_bonus_id', type: 'string', required: true, desc: 'the games-platform bonus id' },
      { name: 'source_type', type: "'LEVEL'|'RANK'", required: true, desc: 'what granted it' },
      { name: 'source_id', type: 'string', required: false, desc: 'level number or rank id' },
      { name: 'bonus_name', type: 'string', required: false, desc: 'defaults to "Bonus"' },
      { name: 'bonus_type', type: 'string', required: false, desc: 'e.g. BONUS_CASH' },
      { name: 'amount', type: 'number', required: false },
      { name: 'amount_type', type: "'RM'|'BM'", required: false, desc: 'Real Money / Bonus Money' },
      { name: 'email', type: 'string', required: false, desc: 'player email (resolves the GAMRU player)' },
      { name: 'external_id', type: 'string', required: false, desc: 'the games-platform user id' },
      { name: 'source', type: 'string', required: false, desc: 'origin platform, defaults to Games platform' },
    ]},
    response: { status: 200, example: j({ success: true, message: 'Bonus claim recorded', data: { id: 'uuid' } }) },
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

  // Mission bundles — each per-mission action proxies to the dedicated gamru
  // mission-bundle endpoint (POST /api/mission-bundles/:id/missions/:missionId/*),
  // so the bundle's independent track is owned end-to-end by gamru.
  {
    id: 'games-bundles-list',
    platform: 'games', group: 'Mission Bundles', method: 'GET', path: '/api/mission-bundles',
    title: 'List bundles', auth: 'player',
    summary: 'Curated mission groups the player is eligible for (with periodicity + grouped progress). Branding comes from the gamru profile payload; each bundle’s grouped missions carry the player’s per-bundle-track progress.',
    response: { status: 200, example: j({ branding: { banner_desktop: '...', banner_mobile: '...' }, bundles: [{ id: 'uuid', name: 'Daily quests', periodicity: 'DAILY', completed: 2, total: 5, missions: [{ id: 'm1', name: 'Spin 10x', status: 'IN_PROGRESS', progress: 4, target: 10 }] }] }) },
  },
  {
    id: 'games-bundles-get',
    platform: 'games', group: 'Mission Bundles', method: 'GET', path: '/api/mission-bundles/:id',
    title: 'Get one bundle', auth: 'player',
    summary: 'One bundle with its grouped missions + the player’s per-bundle-track progress. 404 if the player is not eligible for it.',
    params: { fields: [{ name: 'id', type: 'uuid', required: true, desc: 'bundle id' }] },
    response: { status: 200, example: j({ id: 'uuid', name: 'Daily quests', periodicity: 'DAILY', completed: 2, total: 5, missions: [{ id: 'm1', status: 'IN_PROGRESS', progress: 4, target: 10 }] }) },
  },
  {
    id: 'games-bundles-join',
    platform: 'games', group: 'Mission Bundles', method: 'POST', path: '/api/mission-bundles/:bundleId/missions/:missionId/join',
    title: 'Join mission in bundle', auth: 'player',
    summary: 'Join a mission that belongs to a bundle on the bundle’s own track (independent of the standalone Missions tab; no bucket exclusivity). Proxies to gamru POST /api/mission-bundles/:bundleId/missions/:missionId/join.',
    params: { fields: [
      { name: 'bundleId', type: 'uuid', required: true },
      { name: 'missionId', type: 'uuid', required: true },
    ]},
    response: { status: 200, example: j({ id: 'm1', status: 'IN_PROGRESS', progress: 0, target: 10 }) },
  },
  {
    id: 'games-bundles-claim',
    platform: 'games', group: 'Mission Bundles', method: 'POST', path: '/api/mission-bundles/:bundleId/missions/:missionId/claim',
    title: 'Claim mission in bundle', auth: 'player',
    summary: 'Claim a completed mission on a bundle’s independent track. Proxies to gamru POST /api/mission-bundles/:bundleId/missions/:missionId/claim, which grants the reward and bumps the operator console’s bundle “Participated” count.',
    params: { fields: [
      { name: 'bundleId', type: 'uuid', required: true },
      { name: 'missionId', type: 'uuid', required: true },
    ]},
    response: { status: 200, example: j({ reward_label: '1 Free Spin' }) },
  },
  {
    id: 'games-bundles-cancel',
    platform: 'games', group: 'Mission Bundles', method: 'POST', path: '/api/mission-bundles/:bundleId/missions/:missionId/cancel',
    title: 'Cancel mission in bundle', auth: 'player',
    summary: 'Abandon a running mission on a bundle’s track (returns it to AVAILABLE for that bundle only). Proxies to gamru POST /api/mission-bundles/:bundleId/missions/:missionId/cancel.',
    params: { fields: [
      { name: 'bundleId', type: 'uuid', required: true },
      { name: 'missionId', type: 'uuid', required: true },
    ]},
    response: { status: 200, example: j({ success: true }) },
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
  'gamru-players-reward-claim',
  'gamru-players-shop-purchase',
  // mission & tournament player surface — GAMRU owns progress, via the
  // integration API below (the old by-email / events / leaderboard duplicates
  // were removed in favour of these).
  // integration API — GAMRU-owned mission & tournament progress (source of truth)
  'gamru-int-missions-list',
  'gamru-int-missions-get',
  'gamru-int-missions-join',
  'gamru-int-missions-cancel',
  'gamru-int-missions-progress-get',
  'gamru-int-missions-progress-post',
  'gamru-int-missions-claim',
  // mission-bundle player surface — eligible bundles + per-member-mission
  // lifecycle on the bundle's own track.
  'gamru-int-bundles-list',
  'gamru-int-bundles-get',
  'gamru-int-bundles-mission-join',
  'gamru-int-bundles-mission-cancel',
  'gamru-int-bundles-mission-progress-get',
  'gamru-int-bundles-mission-progress-post',
  'gamru-int-bundles-mission-claim',
  'gamru-int-tournaments-list',
  'gamru-int-tournaments-get',
  'gamru-int-tournaments-join',
  'gamru-int-tournaments-progress',
  'gamru-int-tournaments-leaderboard',
  'gamru-int-tournaments-score',
  'gamru-int-tournaments-claim',
  'gamru-int-user-missions',
  'gamru-int-user-tournaments',
  'gamru-int-user-progress',
  'gamru-int-user-rewards',
  'gamru-int-user-claims',
  'gamru-int-activity',
  // campaign inbox player surface — the read side of campaign delivery
  'gamru-int-inbox-list',
  'gamru-int-inbox-read',
  'gamru-int-inbox-click',
  'gamru-int-inbox-unsubscribe',
  // profile / progression / ranks / rewards / shop player surface (own tabs)
  'gamru-user-profile-get',
  'gamru-user-xp-event',
  'gamru-user-rankprogress-get',
  'gamru-user-ranks-get',
  'gamru-user-rewards-get',
  'gamru-user-shop-get',
  // bonus claim mirror — the games platform records a claim (S2S, client key)
  'gamru-user-bonuses-record',
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
