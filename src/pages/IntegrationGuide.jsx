import { Link } from 'react-router-dom'
import { CodeBlock } from '../components/primitives'

const ENV = `# games platform env
GAMRU_BACKEND_URL=https://gamru-backend-2.onrender.com/api   # base URL of the gamru engine
GAMRU_CLIENT_AUTH_KEY=ck_live_9f2c...           # per-client key (REQUIRED — process won't start without it)
SERVICE_SHARED_KEY=hamara-gamify-shared-service-key  # shared S2S secret for /integration/events
GAMRU_TIMEOUT_MS=8000                           # outbound request timeout`

const EVENT = `// On any player action, push a fact to the engine (fire-and-forget).
await fetch(\`\${GAMRU_BACKEND_URL}/integration/events\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-client-auth-key': process.env.GAMRU_CLIENT_AUTH_KEY,
    'x-service-key': process.env.SERVICE_SHARED_KEY,
  },
  body: JSON.stringify({
    event_id: \`WAGER:\${userId}:\${roundId}\`, // unique & stable -> idempotent
    event_type: 'WAGER',
    external_id: String(userId),
    amount: bet,
    meta: { game_id, game_category, bet },
  }),
}).catch((e) => log.warn('gamru event failed', e)) // never throw`

const SNAPSHOT = `// Render any gamified screen from one snapshot call.
const res = await fetch(\`\${GAMRU_BACKEND_URL}/players/by-email\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-client-auth-key': process.env.GAMRU_CLIENT_AUTH_KEY,
  },
  body: JSON.stringify({ email }),
})
const { data } = await res.json()
// data.gamification.{ progress, missions, mission_bundles, tournaments, reward_shop, rewards, logs }`

export default function IntegrationGuide() {
  return (
    <div className="doc-content">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Integration guide</h1>
      <p>
        Wiring a games platform to gamru takes five steps. Follow them in order; each builds on the last. By the end
        your players earn XP, progress missions and claim rewards — all backed by the engine.
      </p>

      <Step n="1" title="Register your client & set env vars">
        <p>
          Ask an operator to register your client (<code>POST /api/clients/add</code>). Copy the returned{' '}
          <code>auth_key</code> and configure your platform:
        </p>
        <div className="not-prose my-4">
          <CodeBlock label=".env" code={ENV} />
        </div>
        <p>
          On boot, verify the key with <code>GET /api/clients/me</code> — it returns your client identity and{' '}
          <code>status</code>. A 401 means a bad key; 403 means the client is disabled.
        </p>
      </Step>

      <Step n="2" title="Link players on signup">
        <p>
          When a player registers, push <code>USER_REGISTERED</code> with their <code>email</code>. gamru links{' '}
          <code>(origin, external_id) → player</code> by email so all later events attach to one record. See the{' '}
          <Link to="/flows/onboarding">onboarding flow</Link>.
        </p>
      </Step>

      <Step n="3" title="Push gameplay & lifecycle events">
        <p>
          This is the workhorse. Every meaningful action becomes an event. Keep <code>event_id</code> unique and
          stable so retries are deduped, and never let a failed push break gameplay:
        </p>
        <div className="not-prose my-4">
          <CodeBlock label="push an event (Node)" code={EVENT} />
        </div>
        <p>Common event types:</p>
        <div className="not-prose my-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Player action</th>
                <th className="px-3 py-2">event_type</th>
                <th className="px-3 py-2">Drives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                ['Signs up', 'USER_REGISTERED', 'Account linking'],
                ['Plays a round / bets', 'WAGER', 'XP, wager missions'],
                ['Wins', 'CASINO_WIN', 'Win missions'],
                ['Deposits', 'DEPOSIT_MADE', 'Depositor segment, deposit missions'],
                ['Logs in', 'LOGIN (once/day)', 'Login missions, streaks'],
                ['Earns XP directly', 'XP_AWARDED', 'Level & rank'],
              ].map((r) => (
                <tr key={r[1]}>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{r[0]}</td>
                  <td className="px-3 py-2 font-mono text-xs text-brand-700 dark:text-brand-300">{r[1]}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          XP can also be awarded with the convenience call <code>POST /api/players/by-email/add-xp</code>, which
          returns the recomputed level/rank in the response.
        </p>
      </Step>

      <Step n="4" title="Render the gamification snapshot">
        <p>
          For missions, ranks, tournaments, the shop and rewards, read one snapshot and render it. Refresh
          periodically (the reference UI polls ~10s and on window focus) so progress earned mid-play appears:
        </p>
        <div className="not-prose my-4">
          <CodeBlock label="read snapshot (Node)" code={SNAPSHOT} />
        </div>
      </Step>

      <Step n="5" title="Proxy player actions">
        <p>When the player claims or buys, forward the action to gamru — it performs the authoritative mutation:</p>
        <ul>
          <li><strong>Claim mission</strong> → <code>POST /api/players/:id/missions/:missionId/claim</code></li>
          <li><strong>Claim reward</strong> → <code>POST /api/players/:id/rewards/:rewardId/claim</code></li>
          <li><strong>Buy in shop</strong> → <code>POST /api/players/:id/reward-shop/purchase</code> (atomic token charge)</li>
          <li><strong>Submit score</strong> → <code>POST /api/tournament-leaderboard/:id/score</code></li>
        </ul>
      </Step>

      <h2>That’s it</h2>
      <p>
        Once events flow in and the snapshot renders, every <Link to="/">core flow</Link> works. Jump to a specific
        flow to see the exact call sequence, or browse the full <Link to="/api/gamru">Gamru API</Link>.
      </p>
    </div>
  )
}

function Step({ n, title, children }) {
  return (
    <section className="mt-10 border-l-2 border-brand-200 pl-6 dark:border-brand-500/30">
      <div className="mb-2 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
          {n}
        </span>
        <h2 className="!mt-0 text-xl">{title}</h2>
      </div>
      <div className="doc-content">{children}</div>
    </section>
  )
}
