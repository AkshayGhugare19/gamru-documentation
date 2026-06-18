import { Link } from 'react-router-dom'
import { Target, Trophy, Plus, Pencil, Eye, Trash2, UserCog, ArrowRight, ListTree } from 'lucide-react'
import { MethodBadge, AuthBadge, CodeBlock, Pill } from '../../components/primitives'
import { endpointById } from '../../data/endpoints'

// Endpoint chip → detail page in the ADMIN panel.
function EndpointLink({ id }) {
  const ep = endpointById(id)
  if (!ep) return null
  return (
    <Link
      to={`/admin/endpoints/${ep.id}`}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs transition hover:border-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-rose-500/40"
    >
      <MethodBadge method={ep.method} className="scale-90" />
      <span className="font-mono text-slate-600 dark:text-slate-300">{ep.path}</span>
      <AuthBadge auth={ep.auth} />
    </Link>
  )
}

const MISSION_BODY = `// CREATE a mission — POST /api/gamification/missions/add
{
  "name": "Spin 10 slots",
  "description": "Play 10 slot rounds to win bonus cash",
  "status": "ACTIVE",          // INACTIVE until you set it live
  "priority": 1,                // higher shows first
  "tags": ["daily"],
  "data": {                     // feature-specific JSONB the engine reads
    "objectives": [
      { "event": "WAGER", "measure": "count", "target": 10, "game_category": "slots", "min_bet": 1 }
    ],
    "time": { "type": "lifetime" },     // or { "type": "custom", "start": "...", "end": "..." }
    "reward_type": "bonus_cash",         // bonus_cash | free_spins | xp | tokens
    "reward_amount": 10                   // granted when the player claims
  }
}`

const TOURNAMENT_BODY = `// CREATE a tournament — POST /api/gamification/tournaments/add
{
  "name": "Weekend Race",
  "status": "ACTIVE",
  "priority": 1,
  "tags": ["weekly"],
  "data": {                     // schedule / scoring / prizes (presentation + config)
    "start_date": "2026-06-20T00:00:00Z",
    "end_date": "2026-06-22T23:59:59Z",
    "metric": "points",
    "scoring_event": "WAGER",
    "prizes": [
      { "rank": 1, "reward_type": "bonus_cash", "amount": 500 },
      { "rank": 2, "reward_type": "bonus_cash", "amount": 250 }
    ],
    "banner": "https://cdn.example.com/tournaments/weekend-race.png"
  }
}
// Players' points arrive via POST /api/tournament-leaderboard/{thisTournamentId}/score
// and you read the ranking via GET /api/tournament-leaderboard/{thisTournamentId}`

// CRUD verbs shared by both features (the gamification router is generic).
const crud = (feature) => [
  {
    icon: Plus,
    verb: 'CREATE',
    title: `Create a ${feature}`,
    body: `POST …/add with name, status and the data blob. Leave status INACTIVE while you draft it; set ACTIVE to publish to players.`,
  },
  {
    icon: ListTree,
    verb: 'LIST',
    title: `List ${feature}s`,
    body: `GET …/paginate with page, limit, search, status, tag and archived filters — the console grid.`,
  },
  {
    icon: Eye,
    verb: 'GET',
    title: `Get a ${feature}`,
    body: `GET …/:id returns one record with its full data blob. 404 if it doesn't exist.`,
  },
  {
    icon: Pencil,
    verb: 'UPDATE',
    title: `Update a ${feature}`,
    body: `POST …/update-by/:id. The data blob is replaced wholesale, so send the objectives/prizes you want to keep. Use archive-by/:id to take it offline without deleting.`,
  },
  {
    icon: Trash2,
    verb: 'DELETE',
    title: `Delete a ${feature}`,
    body: `DELETE …/:id permanently removes it. Prefer archive when you only want to hide it from players — delete is irreversible.`,
  },
]

const MISSION_EPS = {
  CREATE: 'gamru-missions-add',
  LIST: 'gamru-missions-paginate',
  GET: 'gamru-missions-get',
  UPDATE: 'gamru-missions-update',
  DELETE: 'gamru-missions-delete',
}
const TOURNAMENT_EPS = {
  CREATE: 'gamru-tournaments-add',
  LIST: 'gamru-tournaments-paginate',
  GET: 'gamru-tournaments-get',
  UPDATE: 'gamru-tournaments-update',
  DELETE: 'gamru-tournaments-delete',
}

function CrudList({ feature, epMap }) {
  return (
    <div className="mt-4 space-y-3">
      {crud(feature).map((c) => {
        const Icon = c.icon
        const ep = endpointById(epMap[c.verb])
        return (
          <div
            key={c.verb}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-300">
                <Icon size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                    {c.verb}
                  </span>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{c.title}</h4>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{c.body}</p>
                {ep && (
                  <Link
                    to={`/admin/endpoints/${ep.id}`}
                    className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs transition hover:border-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-rose-500/40"
                  >
                    <MethodBadge method={ep.method} className="scale-90" />
                    <span className="font-mono text-slate-600 dark:text-slate-300">{ep.path}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function MissionsTournaments() {
  return (
    <div>
      {/* hero */}
      <div className="not-prose overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-rose-50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-rose-500/10 dark:to-slate-900/40 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-rose-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">
          <UserCog size={13} /> Admin · Missions &amp; Tournaments
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Create &amp; manage missions and tournaments
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
          Missions and tournaments are both <strong className="text-slate-900 dark:text-white">gamification
          features</strong> served by one generic router. Every feature has the same five operations —
          <strong className="text-slate-900 dark:text-white"> create</strong>,{' '}
          <strong className="text-slate-900 dark:text-white">list</strong>,{' '}
          <strong className="text-slate-900 dark:text-white">get</strong>,{' '}
          <strong className="text-slate-900 dark:text-white">update</strong> and{' '}
          <strong className="text-slate-900 dark:text-white">delete</strong> — only the feature segment in the
          path and the <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">data</code> blob change.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Pill tone="slate">Base URL: https://gamru-backend-2.onrender.com/api</Pill>
          <Pill tone="slate">Auth: operator JWT</Pill>
        </div>
      </div>

      {/* the shared pattern */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">One pattern, every feature</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Swap <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">:feature</code> for{' '}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">missions</code> or{' '}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">tournaments</code> (the same paths also
          serve mission-bundles, ranks, reward-shop, rules, …).
        </p>
        <div className="mt-3">
          <CodeBlock
            label="the generic gamification router"
            code={`POST   /api/gamification/:feature/add            → create
GET    /api/gamification/:feature/paginate       → list (page, limit, search, status, tag, archived)
GET    /api/gamification/:feature/:id            → get one
POST   /api/gamification/:feature/update-by/:id  → update
POST   /api/gamification/:feature/archive-by/:id → archive / restore  (soft)
DELETE /api/gamification/:feature/:id            → delete  (hard)`}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <EndpointLink id="gamru-gam-add" />
          <EndpointLink id="gamru-gam-get" />
          <EndpointLink id="gamru-gam-delete" />
        </div>
      </div>

      {/* Missions */}
      <section className="mt-10">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-300">
          <Target size={20} />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Missions</h2>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          A mission’s objective, time window and reward all live in its{' '}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">data</code> blob — that is exactly what
          the engine reads to track per-player progress and what it grants when the player claims.
        </p>
        <div className="mt-4">
          <CodeBlock label="mission — create body" code={MISSION_BODY} />
        </div>
        <CrudList feature="mission" epMap={MISSION_EPS} />
      </section>

      {/* Tournaments */}
      <section className="mt-12">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
          <Trophy size={20} />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Tournaments</h2>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          A tournament’s schedule, scoring and prize ladder live in its{' '}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">data</code> blob. The live standings are
          keyed by the tournament’s id: players’ points arrive on the leaderboard score endpoint, and you read
          the ranking back from the standings endpoint.
        </p>
        <div className="mt-4">
          <CodeBlock label="tournament — create body" code={TOURNAMENT_BODY} />
        </div>
        <CrudList feature="tournament" epMap={TOURNAMENT_EPS} />
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="self-center text-xs uppercase tracking-wider text-slate-400">Standings:</span>
          <EndpointLink id="gamru-tlb-get" />
        </div>
      </section>

      {/* Per-player progress (operator console Gamification tab) */}
      <section className="mt-12">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-300">
          <Eye size={20} />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Inspect a player’s progress
          </h2>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          GAMRU is the single source of truth for mission &amp; tournament progress, so the operator console can
          show it directly. A player’s <strong>Gamification</strong> tab reads these admin (JWT) endpoints —
          per-player mission progress (status, progress/target, completed &amp; claimed times) and tournament
          standings (rank, score, prize, claim status) — the same rows the games platform consumes via{' '}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">/api/integration</code>.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <EndpointLink id="gamru-players-missions" />
          <EndpointLink id="gamru-players-bundles" />
          <EndpointLink id="gamru-players-tournaments" />
          <EndpointLink id="gamru-players-rewards" />
        </div>
      </section>

      {/* footer pointer */}
      <Link
        to="/admin/endpoints"
        className="group mt-12 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-rose-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-rose-500/40"
      >
        <span className="min-w-0">
          <span className="block text-xs uppercase tracking-wider text-slate-400">Full reference</span>
          <span className="font-medium text-slate-800 dark:text-slate-100">
            Every admin endpoint, with request/response in 6 languages
          </span>
        </span>
        <ArrowRight size={16} className="ml-auto shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-rose-500" />
      </Link>
    </div>
  )
}
