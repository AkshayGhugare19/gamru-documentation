// ---------------------------------------------------------------------------
// Task recipes — "how do I use Gamru in my own platform?" from the integrator's
// point of view. Each guide is a self-contained job with copy-paste code.
//
// A guide:
//   id          : route slug (/guides/:id)
//   title       : the job, phrased as an outcome
//   tag         : short category chip
//   icon        : lucide icon name (mapped in the page)
//   summary     : one line for the index card
//   intro       : plain-English framing
//   prerequisites?: bullets the reader needs first
//   steps       : ordered [{ title, body, code?: { label, code }, endpoints?: [endpointId] }]
//   flow?       : related end-to-end flow id (deep dive)
// ---------------------------------------------------------------------------

const ENV = `# .env on your platform backend (server-side only — never ship the key to the browser)
GAMRU_BACKEND_URL=https://gamru-backend-2.onrender.com/api      # base URL of the gamru engine
GAMRU_CLIENT_AUTH_KEY=ck_live_9f2c...              # your per-client key (REQUIRED)
SERVICE_SHARED_KEY=hamara-gamify-shared-service-key # shared S2S secret for /integration/events`

const VERIFY = `// On boot, confirm the key is valid and your client is enabled.
const res = await fetch(\`\${process.env.GAMRU_BACKEND_URL}/clients/me\`, {
  headers: { 'x-client-auth-key': process.env.GAMRU_CLIENT_AUTH_KEY },
})
if (!res.ok) throw new Error('Gamru rejected the client key') // 401 bad key · 403 disabled
const { data } = await res.json()
console.log(\`Connected to Gamru as \${data.name} (\${data.status})\`)`

const HELPERS = `// gamru.js — a tiny reusable client the other recipes import.
const BASE = process.env.GAMRU_BACKEND_URL
const s2s = { 'x-client-auth-key': process.env.GAMRU_CLIENT_AUTH_KEY }

// Push a fact to the engine. Fire-and-forget: a failure must never break gameplay.
export const postEvent = (body) =>
  fetch(\`\${BASE}/integration/events\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...s2s, 'x-service-key': process.env.SERVICE_SHARED_KEY },
    body: JSON.stringify(body),
  }).catch((e) => console.warn('gamru event failed', e))

// Read the whole gamification snapshot for one player.
export const getSnapshot = (email) =>
  fetch(\`\${BASE}/players/by-email\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...s2s },
    body: JSON.stringify({ email }),
  }).then((r) => r.json())

// Authoritative mutations (claim / buy / score) are plain S2S POSTs.
export const s2sPost = (path, body) =>
  fetch(\`\${BASE}\${path}\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...s2s },
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => r.json())`

const LINK = `// Right after your own signup succeeds, mirror the player into Gamru by email.
await postEvent({
  event_id: \`USER_REGISTERED:\${userId}\`, // stable -> idempotent, safe to retry
  event_type: 'USER_REGISTERED',
  external_id: String(userId),            // your platform's user id
  email,                                  // Gamru links external_id -> player by email
})`

const XP_EVENT = `// Option A — push the raw fact and let Gamru's XP rules decide the award.
await postEvent({
  event_id: \`WAGER:\${userId}:\${roundId}\`,
  event_type: 'WAGER',                 // WAGER · CASINO_WIN · DEPOSIT_MADE · LOGIN ...
  external_id: String(userId),
  amount: bet,
  meta: { game_id, game_category: 'slots', bet },
})`

const XP_DIRECT = `// Option B — award an explicit amount and read back the recomputed level/rank.
const { data } = await s2sPost('/players/by-email/add-xp', {
  email,
  amount: 50,
  game: { category: 'slots', provider: 'NetEnt' }, // optional: feeds personalization
})
// data -> { xp_points, level, rank_name, xp_to_next }`

const PROGRESS = `// One snapshot call powers the whole progression header.
const { data } = await getSnapshot(email)

const { level, rank_name, xp_points, xp_to_next } = data
const pctToNext = Math.round((xp_points / (xp_points + xp_to_next)) * 100)
// e.g. Level 7 · Silver · 1240 XP · 62% to next rank`

const MISSIONS_READ = `// Missions (and their live progress) come straight off the snapshot.
const { data } = await getSnapshot(email)

const missions = data.gamification.missions
// each -> { id, name, status, progress, target, reward_label }
//   status: IN_PROGRESS -> COMPLETED -> CLAIMED`

const MISSIONS_CLAIM = `// When a COMPLETED mission is claimed, forward it to Gamru (it owns the reward).
const { data } = await s2sPost(
  \`/players/\${playerId}/missions/\${missionId}/claim\`,
)
// data -> { reward_type: 'XP', reward: '50' } and the mission flips to CLAIMED`

const REWARDS = `// Read rewards off the snapshot, then claim through Gamru.
const { data } = await getSnapshot(email)
const rewards = data.gamification.rewards // [{ id, reward_type, reward, status }]

// Player taps "claim":
const claimed = await s2sPost(\`/players/\${playerId}/rewards/\${rewardId}/claim\`)
// claimed.data -> { id, status: 'CLAIMED' }`

const SHOP = `// Spend tokens on a reward-shop item. Gamru charges atomically
// (token deduction + stock + audit all commit together).
const { data } = await s2sPost(
  \`/players/\${playerId}/reward-shop/purchase\`,
  { shop_item_id: itemId, quantity: 1 },
)
// data -> { tokens_remaining, tokens_spent }`

const TOURNAMENT = `// Submit a player's points. Idempotent on (email, tournamentId),
// so re-sending the same running total is always safe.
const { data } = await s2sPost(
  \`/tournament-leaderboard/\${tournamentId}/score\`,
  { email, points: 1500 },
)
// data -> { tournamentId, email, points, rank }`

export const GUIDES = [
  {
    id: 'setup',
    title: 'Set up & connect to Gamru',
    tag: 'Setup',
    icon: 'KeyRound',
    summary: 'Configure your client key, verify the connection on boot, and add a tiny reusable client.',
    intro:
      'Gamru is a service you call from your platform backend — every call is server-to-server with your client key. Do this once and the rest of the recipes just import a helper.',
    prerequisites: [
      'An operator has registered your client (POST /api/clients/add) and handed you the generated auth_key.',
    ],
    steps: [
      {
        title: 'Configure environment variables',
        body: 'Keep the client key on the server only. The platform should refuse to start without it.',
        code: { label: '.env', code: ENV },
      },
      {
        title: 'Verify the key on boot',
        body: 'Call clients/me at startup so a bad or disabled key fails loudly instead of silently dropping events later.',
        code: { label: 'verify on boot (Node)', code: VERIFY },
        endpoints: ['gamru-clients-me'],
      },
      {
        title: 'Wrap the calls once',
        body: 'Every later recipe uses these three helpers — postEvent, getSnapshot and s2sPost. Define them once and import them everywhere.',
        code: { label: 'gamru.js', code: HELPERS },
      },
    ],
  },
  {
    id: 'link-players',
    title: 'Link your players to Gamru',
    tag: 'Identity',
    icon: 'UserPlus',
    summary: 'Mirror a player into Gamru on signup so every later XP, deposit and mission event attaches to one record.',
    intro:
      'Gamru identifies a player by email. Push USER_REGISTERED once and Gamru maps (origin, external_id) → player. Every later event that carries the same external_id resolves to that player automatically.',
    steps: [
      {
        title: 'Push USER_REGISTERED on signup',
        body: 'Fire-and-forget right after your own user row is created. If it fails, nothing breaks — the link is re-established the next time an event arrives with the email.',
        code: { label: 'link a player (Node)', code: LINK },
        endpoints: ['gamru-integration-events'],
      },
    ],
    flow: 'onboarding',
  },
  {
    id: 'award-xp',
    title: 'Award XP when a player acts',
    tag: 'Progression',
    icon: 'Rocket',
    summary: 'Turn gameplay into XP — either push the raw event and let Gamru’s rules score it, or award an explicit amount.',
    intro:
      'Gamru is the single source of truth for XP — your platform never computes level or rank itself. You have two ways to feed it.',
    steps: [
      {
        title: 'Option A — push the event (rules decide)',
        body: 'Send the fact (a wager, a win, a deposit) and let the engine apply your configured XP rules. Best when XP amounts are governed in the Gamru console.',
        code: { label: 'push an event (Node)', code: XP_EVENT },
        endpoints: ['gamru-integration-events'],
      },
      {
        title: 'Option B — award an explicit amount',
        body: 'Send a precomputed amount (e.g. after applying a booster on your side) and read the recomputed level/rank straight back from the response.',
        code: { label: 'add XP directly (Node)', code: XP_DIRECT },
        endpoints: ['gamru-players-add-xp'],
      },
    ],
    flow: 'xp-leveling',
  },
  {
    id: 'show-progress',
    title: 'Show level, rank & progress',
    tag: 'Progression',
    icon: 'BarChart3',
    summary: 'Render the player’s progression header from a single snapshot call.',
    intro:
      'One call to the snapshot returns everything a gamified screen needs. Refresh it periodically (the reference UI polls ~10s and on window focus) so progress earned mid-play appears without a reload.',
    steps: [
      {
        title: 'Read the snapshot and render',
        body: 'level, rank_name, xp_points and xp_to_next are top-level on the player record — compute a progress bar from them.',
        code: { label: 'render progression (Node)', code: PROGRESS },
        endpoints: ['gamru-players-by-email'],
      },
    ],
    flow: 'xp-leveling',
  },
  {
    id: 'run-missions',
    title: 'Run missions in your app',
    tag: 'Gamification',
    icon: 'Target',
    summary: 'List missions with live progress and let players claim a completed mission’s reward.',
    intro:
      'Operators author missions in the Gamru console; gameplay events you already send drive the progress. Your app just renders the list and proxies the claim.',
    steps: [
      {
        title: 'List missions with progress',
        body: 'Missions arrive on the snapshot, each already carrying the player’s live progress and status.',
        code: { label: 'read missions (Node)', code: MISSIONS_READ },
        endpoints: ['gamru-players-by-email', 'games-missions-list'],
      },
      {
        title: 'Claim a completed mission',
        body: 'On a COMPLETED mission, forward the claim to Gamru — it grants the reward and flips the mission to CLAIMED.',
        code: { label: 'claim a mission (Node)', code: MISSIONS_CLAIM },
        endpoints: ['gamru-int-missions-claim'],
      },
    ],
    flow: 'missions',
  },
  {
    id: 'claim-rewards',
    title: 'Let players claim rewards',
    tag: 'Economy',
    icon: 'Gift',
    summary: 'Surface a player’s rewards and claim them through Gamru, the reward ledger of record.',
    intro:
      'Rewards land in Gamru from missions, level-ups or manual operator grants. Your app reads them from the snapshot and forwards the claim — Gamru applies it and writes the audit row.',
    steps: [
      {
        title: 'List and claim',
        body: 'Read gamification.rewards from the snapshot; when the player taps claim, POST the claim to Gamru.',
        code: { label: 'list & claim (Node)', code: REWARDS },
        endpoints: ['gamru-players-rewards', 'gamru-players-reward-claim'],
      },
    ],
    flow: 'rewards',
  },
  {
    id: 'reward-shop',
    title: 'Spend tokens in the reward shop',
    tag: 'Economy',
    icon: 'Coins',
    summary: 'Charge tokens for shop items and boosters with a single atomic call.',
    intro:
      'Token balance and stock are owned by Gamru — never decrement them locally. A purchase is one atomic call; if it succeeds the tokens are charged and stock is decremented together.',
    steps: [
      {
        title: 'Purchase an item',
        body: 'Pass the shop_item_id and quantity; read the remaining token balance back from the response.',
        code: { label: 'buy a shop item (Node)', code: SHOP },
        endpoints: ['gamru-players-shop-purchase'],
      },
    ],
    flow: 'reward-shop',
  },
  {
    id: 'tournaments',
    title: 'Run tournaments & leaderboards',
    tag: 'Competition',
    icon: 'Trophy',
    summary: 'Submit player scores to a tournament and let Gamru keep the authoritative standings.',
    intro:
      'Operators schedule tournaments in Gamru. Your app submits points as the player earns them; Gamru ranks participants and awards prizes per the tournament config.',
    steps: [
      {
        title: 'Submit a score',
        body: 'Post the player’s running total. The call is idempotent on (email, tournamentId), so retries can’t double-count.',
        code: { label: 'submit a score (Node)', code: TOURNAMENT },
        endpoints: ['gamru-int-tournaments-score', 'gamru-int-tournaments-leaderboard'],
      },
    ],
    flow: 'tournaments',
  },
]

export function guideById(id) {
  return GUIDES.find((g) => g.id === id)
}
