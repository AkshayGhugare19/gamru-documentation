import { Link } from 'react-router-dom'
import { ArrowRight, Boxes, GitBranch, KeyRound, Rocket, Trophy, Gift, Coins, Megaphone, Target, Layers, Wallet } from 'lucide-react'
import { FLOWS } from '../data/flows'
import { ENDPOINTS } from '../data/endpoints'
import { CAPABILITIES } from '../data/service'

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
          Gamru is a hosted gamification service. It owns players, XP, levels, ranks, missions, mission
          bundles, tournaments, rewards and the token shop — your platform calls its API to register players
          and drive all of it. This portal documents how to integrate Gamru and every endpoint you call.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            to="/use-gamru-service"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700"
          >
            Use Gamru Service <ArrowRight size={16} />
          </Link>
          <Link
            to="/guides"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Use Gamru in your app
          </Link>
          <Link
            to="/architecture"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            How it works
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap gap-6 text-sm">
          <Stat n={gamruCount + '+'} label="Gamru API endpoints" />
          <Stat n={CAPABILITIES.length} label="capability groups" />
          <Stat n={FLOWS.length} label="integration flows" />
        </div>
      </div>

      {/* what you get */}
      <h2>One service, your whole gamification layer</h2>
      <p>
        You don&apos;t build or run an engine. Hold a client key, call the Gamru API server-to-server, and
        render what comes back. Here&apos;s what Gamru manages for you:
      </p>
      <div className="not-prose mt-5 grid gap-4 sm:grid-cols-2">
        <PlatformCard
          tone="brand"
          title="Players & progression"
          sub="register + the XP engine"
          points={[
            'Register a user + player with one call',
            'Source of truth for XP, level & rank',
            'One snapshot call powers every screen',
            'Personalization from gameplay metadata',
          ]}
          to="/use-gamru-service"
          cta="How to integrate"
        />
        <PlatformCard
          tone="slate"
          title="Engagement features"
          sub="missions, rewards, shop, tournaments"
          points={[
            'Missions, mission bundles & tournaments',
            'Reward ledger, token economy & shop',
            'Live progress on a single snapshot call',
            'Idempotent, fire-and-forget integration',
          ]}
          to="/gamru-service-api"
          cta="Browse the API"
        />
      </div>

      {/* flows */}
      <h2>Explore the integration flows</h2>
      <p>Each flow is a complete story — what triggers it, what your platform calls, and how Gamru responds.</p>
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
