import { Link } from 'react-router-dom'
import { ArrowRight, Boxes, User, UserCog, Check } from 'lucide-react'

function Card({ to, tone, Icon, kicker, title, blurb, points, cta }) {
  const toneCls =
    tone === 'admin'
      ? 'from-rose-500 to-rose-700 shadow-rose-600/30'
      : 'from-brand-500 to-brand-700 shadow-brand-600/30'
  const ctaCls =
    tone === 'admin'
      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
      : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/30'
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8"
    >
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ring-1 ring-white/20 ${toneCls}`}
      >
        <Icon size={26} />
      </span>
      <span className="mt-5 text-[11px] font-bold uppercase tracking-wider text-slate-400">{kicker}</span>
      <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h2>
      <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">{blurb}</p>
      <ul className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2">
            <Check size={16} className={`mt-0.5 shrink-0 ${tone === 'admin' ? 'text-rose-500' : 'text-brand-500'}`} />
            {p}
          </li>
        ))}
      </ul>
      <span
        className={`mt-7 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-semibold text-white shadow-lg transition ${ctaCls}`}
      >
        {cta}
        <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

export default function Landing() {
  return (
    <div>
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
          <Boxes size={13} /> Gamru developer portal
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Two ways in. Pick your side.
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
          Gamru is a hosted gamification service. <strong>Admins</strong> manage everything — missions, ranks,
          rewards, campaigns. <strong>Users</strong> (your platform) integrate it and let players use it — register,
          earn XP, complete missions, claim rewards. Choose the documentation that fits you.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
        <Card
          to="/user"
          tone="user"
          Icon={User}
          kicker="I integrate & use Gamru"
          title="User documentation"
          blurb="You plug Gamru into your platform and let players use it. Register a player, then read and act on what Gamru manages."
          points={[
            'Register a user + player with one call',
            'See profile: level, rank, XP & progress',
            'Missions, mission bundles & tournaments',
            'Claim rewards & spend tokens in the shop',
          ]}
          cta="Open user docs"
        />
        <Card
          to="/admin"
          tone="admin"
          Icon={UserCog}
          kicker="I operate Gamru"
          title="Admin documentation"
          blurb="You run the Gamru console. Create and manage everything players experience and every CRM workflow."
          points={[
            'Create / update / delete missions, bundles & ranks',
            'Configure XP & token rules, the reward shop',
            'Build segments, templates & campaigns',
            'Onboard clients, manage settings & analytics',
          ]}
          cta="Open admin docs"
        />
      </div>
    </div>
  )
}
