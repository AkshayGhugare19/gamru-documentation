import { Link } from 'react-router-dom'
import { Target, Trophy, Eye, Activity, Gift, ArrowRight } from 'lucide-react'
import { MethodBadge, AuthBadge, CodeBlock, Pill } from '../../components/primitives'
import { endpointById } from '../../data/endpoints'

// Small clickable endpoint chip → its detail page in the USER panel.
function EndpointLink({ id }) {
  const ep = endpointById(id)
  if (!ep) return null
  return (
    <Link
      to={`/user/endpoints/${ep.id}`}
      className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500/40"
    >
      <MethodBadge method={ep.method} className="scale-90" />
      <span className="font-mono text-slate-600 dark:text-slate-300">{ep.path}</span>
      <AuthBadge auth={ep.auth} />
    </Link>
  )
}

const GET_SNAPSHOT = `// Read missions & tournaments WITH the player's GAMRU-computed progress.
// (resolve the player by email — your client key authorises the call)
const missionsRes = await fetch(
  \`\${process.env.GAMRU_BACKEND_URL}/missions?email=\${encodeURIComponent(email)}\`,
  { headers: { 'x-client-auth-key': process.env.GAMRU_CLIENT_AUTH_KEY } },
)
const { data: m } = await missionsRes.json()
const missions = m.missions   // [{ id, name, status, progress, target, reward_label, ... }]

const tRes = await fetch(
  \`\${process.env.GAMRU_BACKEND_URL}/tournaments?email=\${encodeURIComponent(email)}\`,
  { headers: { 'x-client-auth-key': process.env.GAMRU_CLIENT_AUTH_KEY } },
)
const { data: t } = await tRes.json()
const tournaments = t.tournaments  // [{ id, name, state, prize_pool, games }]
// mission status: AVAILABLE → IN_PROGRESS → COMPLETED → CLAIMED`

const PROGRESS_EVENT = `// Forward each play — GAMRU advances every relevant mission (and, when you
// pass a tournamentId + points, the tournament score). GAMRU computes
// everything; you just forward the fact and cache the returned snapshot.
const res = await fetch(\`\${process.env.GAMRU_BACKEND_URL}/activity\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-client-auth-key': process.env.GAMRU_CLIENT_AUTH_KEY,
  },
  body: JSON.stringify({
    email,
    external_id: String(userId),
    kind: 'play',           // or 'login' to tick login missions
    stake: 5,               // bet / turnover for this play
    win: true,
    winAmount: 12,
    gameKey: 'aviator',
    // optional: scope to a mission/bundle card, and score a tournament too
    tournamentId, points: 150,
  }),
}).catch(() => {}) // fire-and-forget: a failed forward must never break gameplay
const { data } = await res.json() // { missions: [ ...fresh progress ] }`

const CLAIM = `// Player taps "Claim" on a COMPLETED mission → forward it to Gamru.
const res = await fetch(
  \`\${process.env.GAMRU_BACKEND_URL}/missions/\${missionId}/claim\`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-client-auth-key': process.env.GAMRU_CLIENT_AUTH_KEY },
    body: JSON.stringify({ email /*, bundleId for a bundle mission */ }),
  },
)
const { data } = await res.json()
// Gamru grants the mission's reward and flips it to CLAIMED → data.reward_label, data.mission`

const SCORE = `// Submit the player's tournament points as they earn them.
const res = await fetch(
  \`\${process.env.GAMRU_BACKEND_URL}/tournaments/\${tournamentId}/score\`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-client-auth-key': process.env.GAMRU_CLIENT_AUTH_KEY },
    body: JSON.stringify({ email, points: 150, game: 'aviator' }), // points are ADDED to the total
  },
)
const { data } = await res.json() // { tournament_id, score, applied }`

const CLAIM_PRIZE = `// When a tournament has ENDED and the player ranked top-3, claim the prize.
// GAMRU grants their 50/30/20 share into the reward ledger (like a mission reward).
const res = await fetch(
  \`\${process.env.GAMRU_BACKEND_URL}/tournaments/\${tournamentId}/claim\`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-client-auth-key': process.env.GAMRU_CLIENT_AUTH_KEY },
    body: JSON.stringify({ email }),
  },
)
const { data } = await res.json() // { prize }`

const STANDINGS = `// Render the leaderboard — now a client-key call (no operator token needed).
const res = await fetch(
  \`\${process.env.GAMRU_BACKEND_URL}/tournaments/\${tournamentId}/leaderboard?email=\${encodeURIComponent(email)}\`,
  { headers: { 'x-client-auth-key': process.env.GAMRU_CLIENT_AUTH_KEY } },
)
const { data } = await res.json() // { leaderboard: [{ rank, email, name, score, is_me, prize }, …] }`

const STEPS = [
  {
    icon: Eye,
    title: 'GET — read missions & tournaments',
    body:
      'Everything a player sees comes off one snapshot call. The gamification.missions, mission_bundles and tournaments arrays each arrive with their current status and live progress — no separate “list missions” call. Poll it (~10s and on window focus) so progress earned mid-play appears without a reload.',
    code: { label: 'read missions & tournaments (Node)', code: GET_SNAPSHOT },
    endpoints: ['gamru-int-missions-list', 'gamru-int-tournaments-list'],
  },
  {
    icon: Activity,
    title: 'PROGRESS — advance missions & tournaments',
    body:
      'Progress is driven by facts, computed entirely in GAMRU. Forward each play to the integration activity hook — GAMRU advances every IN_PROGRESS mission whose objective matches (wager / bet_count / win / login) and, when you include a tournamentId + points, accumulates the tournament score and re-ranks. Your platform calculates nothing; it forwards the play and caches the returned snapshot.',
    code: { label: 'forward a play (Node)', code: PROGRESS_EVENT },
    endpoints: ['gamru-int-activity', 'gamru-int-missions-progress-post', 'gamru-int-tournaments-score'],
  },
  {
    icon: Gift,
    title: 'CLAIM — collect a completed mission’s reward',
    body:
      'When a mission reaches COMPLETED, the player claims its reward. You forward the claim to GAMRU — it reads the reward from its own trusted mission definition (you only name the mission), lands it in the player’s reward ledger and flips the mission to CLAIMED. Tournament prizes work the same way: once a tournament ends, a top-3 player claims their 50/30/20 share into the reward ledger.',
    code: { label: 'claim a mission (Node)', code: CLAIM },
    endpoints: ['gamru-int-missions-claim', 'gamru-int-tournaments-claim'],
  },
]

export default function MissionsTournaments() {
  return (
    <div>
      {/* hero */}
      <div className="not-prose overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-brand-500/10 dark:to-slate-900/40 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
          <Target size={13} /> User · Missions &amp; Tournaments
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Missions &amp; tournaments in your app
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
          Operators author missions and tournaments in the Gamru console — your platform just renders them and
          lets players play. There are only three things you ever do:{' '}
          <strong className="text-slate-900 dark:text-white">GET</strong> them off the snapshot,{' '}
          <strong className="text-slate-900 dark:text-white">PROGRESS</strong> them by pushing gameplay, and{' '}
          <strong className="text-slate-900 dark:text-white">CLAIM</strong> the reward. Every call is
          server-to-server with your client key.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Pill>Base URL: https://gamru-backend-2.onrender.com/api</Pill>
          <Pill tone="slate">Auth: x-client-auth-key</Pill>
        </div>
      </div>

      {/* mental model */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-300">
            <Target size={18} /> <h3 className="font-semibold text-slate-900 dark:text-white">Missions</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            A task with an objective (e.g. “wager 10 slot rounds”) and a reward chest. State moves{' '}
            <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">IN_PROGRESS → COMPLETED → CLAIMED</code>.
            Mission bundles group several missions into a periodic quest (daily / weekly).
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
            <Trophy size={18} /> <h3 className="font-semibold text-slate-900 dark:text-white">Tournaments</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            A time-boxed competition with a shared leaderboard. You submit each player’s points; Gamru keeps the
            authoritative standings and the operator settles prizes from the final ranking.
          </p>
        </div>
      </div>

      {/* the three steps */}
      <h2 className="mt-10 text-xl font-bold text-slate-900 dark:text-white">The three things you do</h2>
      <div className="mt-5 space-y-5">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          return (
            <div
              key={s.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-600/5 text-brand-600 dark:text-brand-300">
                  <Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step {i + 1}</span>
                  <h3 className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-white">{s.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{s.body}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {s.endpoints.map((id) => (
                      <EndpointLink key={id} id={id} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <CodeBlock label={s.code.label} code={s.code.code} />
              </div>
            </div>
          )
        })}
      </div>

      {/* reading the leaderboard */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
          <Trophy size={18} />
          <h3 className="font-semibold text-slate-900 dark:text-white">Leaderboard &amp; prize claim</h3>
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Read the ranked standings to draw the leaderboard — the integration leaderboard is a client-key call
          (no operator token needed) and flags the requesting player with <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">is_me</code>.
          When the tournament ends, GAMRU settles the prize pool (top-3, 50 / 30 / 20) and the player claims their
          share into the reward ledger.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <CodeBlock label="read standings (Node)" code={STANDINGS} />
          <CodeBlock label="claim a prize (Node)" code={CLAIM_PRIZE} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <EndpointLink id="gamru-int-tournaments-score" />
          <EndpointLink id="gamru-int-tournaments-leaderboard" />
          <EndpointLink id="gamru-int-tournaments-claim" />
        </div>
      </div>

      {/* footer pointer */}
      <Link
        to="/user/endpoints"
        className="group mt-10 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-brand-500/40"
      >
        <span className="min-w-0">
          <span className="block text-xs uppercase tracking-wider text-slate-400">Full reference</span>
          <span className="font-medium text-slate-800 dark:text-slate-100">
            Every mission &amp; tournament endpoint, with request/response in 6 languages
          </span>
        </span>
        <ArrowRight size={16} className="ml-auto shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
      </Link>
    </div>
  )
}
