import { CodeBlock } from '../components/primitives'

const DIAGRAM = `        ADMIN (operator)                 PLAYER (end customer)
        gamru console      ─┐              ┌─  games-platform app
                            │ authoring    │   (missions, shop, ranks…)
                            ▼              ▼
        ┌──────────────────────┐    ┌──────────────────────────┐
        │     GAMRU ENGINE     │◄───│      GAMES PLATFORM       │
        │  gamru-backend       │    │  my-game-platform-backend │
        │                      │    │                           │
        │  • players / XP      │    │  • auth / wallet          │
        │  • level & rank      │    │  • activity / gameplay    │
        │  • missions+bundles  │    │  • renders gamru data     │
        │  • tournaments       │    │  • proxies claims/buys    │
        │  • rewards / tokens  │    │                           │
        │  • CRM & segments    │    │                           │
        └──────────────────────┘    └──────────────────────────┘
            ▲   source of truth          events ▲  (wager / win /
            └─── snapshot + claims ───────────┘   deposit / login …)`

export default function Architecture() {
  return (
    <div className="doc-content">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Architecture</h1>
      <p>
        Gamru follows a strict <strong>engine + client</strong> split. The gamru engine owns all gamification
        state and rules; the games platform owns the player experience and gameplay. They talk over a small,
        well-defined HTTP surface.
      </p>

      <div className="not-prose my-6">
        <CodeBlock label="System overview" code={DIAGRAM} />
      </div>

      <h2>Roles</h2>
      <ul>
        <li>
          <strong>Gamru engine</strong> — the single source of truth. It computes XP, level and rank, evaluates
          mission progress, ranks tournaments, holds the token balance and reward ledger, and runs the CRM. The
          games platform never recomputes any of this.
        </li>
        <li>
          <strong>Games platform</strong> — the casino. It authenticates players, processes wallet/gameplay, and
          renders whatever gamru returns. It <em>pushes events</em> to the engine and <em>proxies</em> player
          actions (claim a reward, buy in the shop, submit a score) to the engine.
        </li>
      </ul>

      <h2>Three communication patterns</h2>
      <p>Every interaction between the two services is one of these:</p>
      <div className="not-prose my-5 space-y-3">
        <Pattern
          n="1"
          title="Fire-and-forget events"
          body="Gameplay & lifecycle facts pushed to POST /api/integration/events. Idempotent on event_id, never throws — a failure is logged but never blocks gameplay."
          tag="Games → Gamru"
        />
        <Pattern
          n="2"
          title="Read the player snapshot"
          body="The casino calls POST /api/players/by-email to get the whole gamification view (progress, missions, bundles, tournaments, shop, rewards) and renders it."
          tag="Games → Gamru"
        />
        <Pattern
          n="3"
          title="Proxied player actions"
          body="Claims, purchases and score submissions are forwarded to gamru, which performs the authoritative mutation (grant reward, charge tokens atomically, update standings)."
          tag="Games → Gamru"
        />
      </div>

      <h2>Why the engine owns state</h2>
      <p>
        Centralising state means a player has one XP total, one token balance and one reward ledger no matter how
        many skins or platforms feed the engine. It also makes gameplay resilient: if the engine is briefly
        unreachable, the casino still works — events queue conceptually as retries, and the next successful call
        reconciles the player.
      </p>

      <h2>Graceful degradation</h2>
      <ul>
        <li><strong>Engine unreachable</strong> → casino logs a warning and renders empty/fallback; gameplay continues.</li>
        <li><strong>401 (bad/missing key)</strong> → auth-facing reads return 503; fix the client key.</li>
        <li><strong>403 (client disabled)</strong> → re-enable the client in the gamru console.</li>
        <li><strong>Event push fails</strong> → logged only; re-sent with the same event_id (deduped).</li>
      </ul>
    </div>
  )
}

function Pattern({ n, title, body, tag }) {
  return (
    <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 font-bold text-white">{n}</span>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
            {tag}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{body}</p>
      </div>
    </div>
  )
}
