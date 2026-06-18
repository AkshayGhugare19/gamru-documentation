// ---------------------------------------------------------------------------
// "Use Gamru Service" — Gamru from the integrating platform's point of view.
//
// This mirrors how a real consumer wires Gamru in: the typed client in
// utils/gamruService.ts. Your backend holds a client key and calls Gamru's
// REST API server-to-server to register players and manage their XP, levels,
// ranks, missions, mission bundles, rewards, the token shop and tournaments.
//
// Every endpoint and payload below is the ACTUAL one your platform calls —
// the same paths gamruService.ts hits. No operator-console / admin tasks.
// ---------------------------------------------------------------------------

// -- code snippets (mirroring utils/gamruService.ts) -------------------------

export const ENV = `# Your platform backend env — server-side only, never ship the key to the browser.
GAMRU_BACKEND_URL=https://gamru-backend-2.onrender.com/api        # gamru base URL  (env.gamru.baseUrl)
GAMRU_CLIENT_AUTH_KEY=ck_live_9f2c...                # your client key — REQUIRED (x-client-auth-key)
SERVICE_SHARED_KEY=hamara-gamify-shared-service-key  # shared S2S secret (x-service-key)
GAMRU_TIMEOUT_MS=8000                                # outbound request timeout`

export const CLIENT = `// A thin client over Gamru — this is what utils/gamruService.ts does for you.
// EVERY request carries your client key; that's how Gamru knows which platform
// (and which players) the call belongs to.
const BASE = process.env.GAMRU_BACKEND_URL;
const headers = {
  'Content-Type': 'application/json',
  'x-client-auth-key': process.env.GAMRU_CLIENT_AUTH_KEY, // identifies your platform
  'x-service-key': process.env.SERVICE_SHARED_KEY,        // S2S defence-in-depth
};

// Never throws — resolves to { ok, status, body } so a gamru blip can't break you.
const call = (method, path, body) =>
  fetch(\`\${BASE}\${path}\`, { method, headers, body: body ? JSON.stringify(body) : undefined })
    .then(async (r) => ({ ok: r.ok, status: r.status, body: await r.json().catch(() => null) }));`

export const VERIFY = `// Verify your key once on boot — GET /clients/me.
const me = await call('GET', '/clients/me');
// me.body.data -> { id, name, slug, skin_id, status: 'ENABLED' }
// 401 = bad/missing key   ·   403 = your client is DISABLED`

export const REGISTER = `// THE registration call. When a user signs up on YOUR platform, mirror them
// into gamru with POST /users/add — it creates the gamru user AND the matching
// player in one shot. In gamruService.ts this is the createGamruUser() helper.
import { createGamruUser, deriveUsername } from './gamruService';

const res = await createGamruUser({
  first_name: input.first_name,
  last_name: input.last_name,
  email: input.email,
  mobile: input.mobile,             // 10–15 digits
  password: plaintext,              // 6–100 chars
  username: deriveUsername(input.email),
  role: 'USER',
  status: 'ACTIVE',
  source: 'GAMIFY',                 // your platform name (sending the key tags it EXTERNAL)
});
// res.body -> { success, message: 'User added successfully', data: { id, email, player_id } }
// Don't fail your own signup if gamru is down — just log it; the player still exists locally.`

export const EVENTS = `// OPTIONAL — notify gamru of lifecycle facts (this is the syncToGamru() helper).
// Real event types: USER_REGISTERED · XP_AWARDED · LEVEL_UP · RANK_UP · DEPOSIT_MADE
await call('POST', '/integration/events', {
  event_id: \`DEPOSIT_MADE:\${userId}:\${depositId}\`, // stable -> idempotent, safe to retry
  event_type: 'DEPOSIT_MADE',
  external_id: String(userId),
  email,
  amount: 100,
  meta: { deposit_count: 3 },
});`

export const SNAPSHOT = `// Read the player + the WHOLE gamification snapshot by email.
// In gamruService.ts this is gamruUserProfileData(email) (POST /players/by-email).
import { gamruUserProfileData } from './gamruService';

const res = await gamruUserProfileData(email);
const p = res.body;
// p.level · p.rank_name · p.xp_points · p.xp_to_next · p.tokens
// p.gamification.{ progress, next_rank, levels, missions, mission_bundles,
//                  tournaments, reward_shop, rewards, logs }`

export const XP = `// Award XP; gamru recomputes level & rank and returns them.
// In gamruService.ts this is gamruAddXpPoints(email, amount, game?).
import { gamruAddXpPoints } from './gamruService';

const res = await gamruAddXpPoints(email, 50, {
  category: 'slots', provider: 'NetEnt', turnover: 5, // optional: feeds personalization
}); // POST /players/by-email/add-xp
// res.body -> { xp_points, level, rank_name, xp_to_next }`

export const MISSIONS = `// Missions (and mission bundles) arrive on the snapshot with live progress —
// just render them. p.gamification.missions -> [{ id, name, status, progress, target, reward_label }]

// Claim a COMPLETED mission via gamru (it owns the reward):
await call('POST', \`/players/\${playerId}/missions/\${missionId}/claim\`);
// or: gamru.players.claimMissionReward(playerId, missionId)`

export const REWARDS = `// Rewards live on the snapshot too: p.gamification.rewards
// When the player claims, forward it — gamru is the reward ledger of record.
await call('POST', \`/players/\${playerId}/rewards/\${rewardId}/claim\`);
// or: gamru.players.claimReward(playerId, rewardId)`

export const SHOP = `// Spend tokens on a shop item. Atomic in gamru — tokens, stock & audit together.
await call('POST', \`/players/\${playerId}/reward-shop/purchase\`, {
  shop_item_id: itemId,
  quantity: 1,
});
// or: gamru.rewardShop.purchase(playerId, { shop_item_id, quantity })
// -> { tokens_remaining, tokens_spent }`

export const TOURNAMENT = `// Submit a player's running points. Idempotent on (email, tournamentId).
await call('POST', \`/tournament-leaderboard/\${tournamentId}/score\`, {
  email,
  name: displayName,
  points: 1500,
});
// or: gamru.tournamentLeaderboard.submitScore(tournamentId, { email, name, points })`

// -- the numbered integration walkthrough ------------------------------------

export const SERVICE_STEPS = [
  {
    title: 'Link your platform & verify the key',
    body: 'Gamru gives you a client key when your platform is onboarded. Keep it on the server and send it as x-client-auth-key on every call (the /integration/events hook also wants the shared x-service-key). Wrap the calls once, then verify the key on boot with /clients/me so a bad or disabled key fails loudly.',
    code: { label: 'a thin gamru client', code: CLIENT },
    code2: { label: 'verify on boot', code: VERIFY },
    endpoints: ['gamru-clients-me'],
  },
  {
    title: 'Register a user — POST /users/add',
    body: 'This is the call your platform makes the moment a user signs up. POST /users/add creates the gamru user AND the matching player in one call, so all later XP, missions and rewards attach to one record. Sending your client key tags the account EXTERNAL to your client. gamruService.ts wraps this as createGamruUser().',
    code: { label: 'register on signup', code: REGISTER },
    endpoints: ['gamru-users-add'],
  },
  {
    title: 'Notify lifecycle events (optional)',
    body: 'If you want gamru to react to deposits, level-ups, etc., push a lifecycle event. It is fire-and-forget and idempotent on event_id. The real event types are USER_REGISTERED, XP_AWARDED, LEVEL_UP, RANK_UP and DEPOSIT_MADE.',
    code: { label: 'push an event', code: EVENTS },
    endpoints: ['gamru-integration-events'],
  },
  {
    title: 'Read everything — the player snapshot',
    body: 'One call to /players/by-email returns the player plus the entire gamification snapshot: progress, levels, ranks, missions, mission bundles, tournaments, the reward shop, rewards and logs. This single read powers every gamified screen — refresh it periodically so progress earned mid-session appears.',
    code: { label: 'read the snapshot', code: SNAPSHOT },
    endpoints: ['gamru-players-by-email'],
  },
  {
    title: 'Award XP, levels & ranks',
    body: 'Gamru is the source of truth for progression — your platform never computes it. Call add-xp by email and read the recomputed level & rank straight back. The optional game block feeds the player’s personalization.',
    code: { label: 'award XP', code: XP },
    endpoints: ['gamru-players-add-xp'],
  },
  {
    title: 'Missions & mission bundles',
    body: 'Operators author missions and bundles in the Gamru console; your platform reads them off the snapshot (with live progress) and renders them. When a mission is COMPLETED, forward the claim and gamru grants the reward and flips it to CLAIMED.',
    code: { label: 'render & claim missions', code: MISSIONS },
    endpoints: ['gamru-int-missions-list', 'gamru-int-missions-claim'],
  },
  {
    title: 'Rewards',
    body: 'Rewards land in gamru from missions, level-ups or operator grants and arrive on the snapshot. Surface them and forward the claim — gamru applies it and writes the audit row.',
    code: { label: 'claim a reward', code: REWARDS },
    endpoints: ['gamru-players-reward-claim'],
  },
  {
    title: 'Reward shop (tokens)',
    body: 'Token balance and stock are owned by gamru. A purchase is one atomic call — tokens, stock and audit all commit together. Read the remaining balance back from the response; never track tokens locally.',
    code: { label: 'buy a shop item', code: SHOP },
    endpoints: ['gamru-players-shop-purchase'],
  },
  {
    title: 'Tournaments & leaderboards',
    body: 'Submit a player’s points as they earn them; gamru keeps the authoritative standings and awards prizes. The call is idempotent on (email, tournamentId), so retries can’t double-count.',
    code: { label: 'submit a score', code: TOURNAMENT },
    endpoints: ['gamru-int-tournaments-score', 'gamru-int-tournaments-leaderboard', 'gamru-int-tournaments-claim'],
  },
]

// -- the API reference, organized by capability ------------------------------
// The endpoints YOUR platform calls (client-key, server-to-server), grouped by
// the job they do. Operator-console configuration lives in the Gamru dashboard
// and is out of scope here — your platform reads & acts on what's configured.

export const CAPABILITIES = [
  {
    key: 'connect',
    icon: 'Plug',
    title: 'Connect',
    summary: 'Authenticate your platform and confirm the engine is reachable.',
    howToUse:
      'Send your client key as x-client-auth-key on every request. Call /clients/me on boot to confirm the key is valid and your client is ENABLED; /health is a plain liveness probe.',
    endpoints: ['gamru-health', 'gamru-clients-me'],
  },
  {
    key: 'register',
    icon: 'UserPlus',
    title: 'Register & identify players',
    summary: 'Create a user+player on signup, and (optionally) push lifecycle events.',
    howToUse:
      'POST /users/add on signup creates the gamru user AND the matching player in one call (the createGamruUser helper). Optionally push USER_REGISTERED / DEPOSIT_MADE / … to /integration/events to notify gamru of lifecycle facts.',
    endpoints: ['gamru-users-add', 'gamru-integration-events'],
  },
  {
    key: 'snapshot',
    icon: 'LayoutDashboard',
    title: 'Read the player snapshot',
    summary: 'One call returns the player plus every gamification feature’s data.',
    howToUse:
      'POST /players/by-email returns the player and the full nested gamification object — render any gamified screen from it. GET /players/:id fetches a single player by id (accepts your client key or an operator token).',
    featuresLabel: 'snapshot includes',
    features: [
      'progress',
      'levels',
      'next_rank',
      'missions',
      'mission_bundles',
      'tournaments',
      'reward_shop',
      'rewards',
      'logs',
    ],
    endpoints: ['gamru-players-by-email', 'gamru-players-get'],
  },
  {
    key: 'xp',
    icon: 'Rocket',
    title: 'XP, levels & ranks',
    summary: 'Drive progression — gamru recomputes level & rank for you.',
    howToUse:
      'POST /players/by-email/add-xp with an amount and an optional game block; read the new xp_points / level / rank_name / xp_to_next straight back. Never compute progression on your side.',
    endpoints: ['gamru-players-add-xp'],
  },
  {
    key: 'missions',
    icon: 'Target',
    title: 'Missions & bundles',
    summary: 'Render missions and bundles from the snapshot; claim completed ones.',
    howToUse:
      'Missions and bundles (with live progress) come down on the snapshot — render them directly. When a mission’s status is COMPLETED, POST the claim and gamru grants the reward and marks it CLAIMED.',
    endpoints: ['gamru-int-missions-list', 'gamru-int-missions-claim'],
  },
  {
    key: 'rewards',
    icon: 'Gift',
    title: 'Rewards',
    summary: 'Surface a player’s rewards and claim them through the ledger of record.',
    howToUse:
      'Read gamification.rewards from the snapshot. When the player claims, POST the claim — gamru owns the ledger and writes the audit trail.',
    endpoints: ['gamru-players-reward-claim'],
  },
  {
    key: 'shop',
    icon: 'Coins',
    title: 'Reward shop',
    summary: 'Charge tokens for shop items and boosters in one atomic call.',
    howToUse:
      'Pass shop_item_id and quantity. gamru charges tokens, decrements stock and writes the audit together; read the remaining balance from the response. Don’t track tokens locally.',
    endpoints: ['gamru-players-shop-purchase'],
  },
  {
    key: 'tournaments',
    icon: 'Trophy',
    title: 'Tournaments & leaderboards',
    summary: 'Submit player scores and read ranked standings.',
    howToUse:
      'POST a player’s running total to /tournament-leaderboard/:id/score; gamru ranks participants and awards prizes. Idempotent on (email, tournamentId).',
    endpoints: ['gamru-int-tournaments-score', 'gamru-int-tournaments-leaderboard', 'gamru-int-tournaments-claim'],
  },
]
