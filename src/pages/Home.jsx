import { Link } from 'react-router-dom'
import { ArrowRight, Boxes, GitBranch, KeyRound, Rocket, Trophy, Gift, Coins, Megaphone, Target, Layers, Wallet } from 'lucide-react'
import { FLOWS } from '../data/flows'
import { ENDPOINTS } from '../data/endpoints'

const FLOW_ICONS = {
  onboarding: KeyRound,
  'xp-leveling': Rocket,
  'deposit-segmentation': Wallet,
  missions: Target,
  'mission-bundles': Layers,
  tournaments: Trophy,
  rewards: Gift,
  'reward-shop': Coins,
  campaigns: Megaphone,
}

export default function Home() {
  const gamruCount = ENDPOINTS.filter((e) => e.platform === 'gamru').length
  const gamesCount = ENDPOINTS.filter((e) => e.platform === 'games').length
  return (
    <div className="doc-content">
      {/* hero */}
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-50 via-white to-white p-8 dark:border-slate-800 dark:from-brand-500/10 dark:via-slate-900 dark:to-slate-950 sm:p-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
          <Boxes size={13} /> Developer portal
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Gamru gamification engine
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
          Gamru is the rules engine and operator console that owns players, XP, levels, ranks, missions,
          tournaments, rewards and CRM. Your games platform sends it events and renders what it returns.
          This portal documents every flow and every endpoint.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/integration"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Start integrating <ArrowRight size={16} />
          </Link>
          <Link
            to="/architecture"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            How it works
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-6 text-sm">
          <Stat n={FLOWS.length} label="end-to-end flows" />
          <Stat n={gamruCount + '+'} label="gamru engine endpoints" />
          <Stat n={gamesCount + '+'} label="games-platform endpoints" />
        </div>
      </div>

      {/* the two platforms */}
      <h2>Two platforms, one player</h2>
      <p>
        Everything here lives across two services. Keep this split in mind and the rest of the docs falls
        into place:
      </p>
      <div className="not-prose mt-5 grid gap-4 sm:grid-cols-2">
        <PlatformCard
          tone="brand"
          title="Gamru engine"
          sub="gamru-backend"
          points={[
            'Source of truth for players, XP, level & rank',
            'Authors & evaluates missions, bundles, tournaments',
            'Owns the reward ledger, token economy & reward shop',
            'CRM: segments, campaigns, templates, triggers',
          ]}
          to="/api/gamru"
          cta="Gamru API"
        />
        <PlatformCard
          tone="slate"
          title="Games platform"
          sub="my-game-platform-backend"
          points={[
            'The casino / player-facing app',
            'Sends gameplay & lifecycle events to gamru',
            'Renders missions, rewards, leaderboards from gamru',
            'Proxies claims & purchases through to gamru',
          ]}
          to="/api/games"
          cta="Games API"
        />
      </div>

      {/* flows */}
      <h2>Explore the flows</h2>
      <p>Each flow is a complete story — what the player does, what the casino sends, and how gamru responds.</p>
      <div className="not-prose mt-5 grid gap-3 sm:grid-cols-2">
        {FLOWS.map((f) => {
          const Icon = FLOW_ICONS[f.id] || GitBranch
          return (
            <Link
              key={f.id}
              to={`/flows/${f.id}`}
              className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/50"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <Icon size={18} />
              </span>
              <span>
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">{f.title}</span>
                </span>
                <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{f.intro.slice(0, 96)}…</span>
              </span>
              <ArrowRight size={16} className="ml-auto mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function Stat({ n, label }) {
  return (
    <div>
      <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{n}</div>
      <div className="text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  )
}

function PlatformCard({ title, sub, points, to, cta, tone }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${tone === 'brand' ? 'bg-brand-500' : 'bg-slate-400'}`} />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>
      <code className="text-xs text-slate-400">{sub}</code>
      <ul className="mt-3 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
        {points.map((p) => (
          <li key={p} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
            {p}
          </li>
        ))}
      </ul>
      <Link to={to} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
        {cta} <ArrowRight size={14} />
      </Link>
    </div>
  )
}
