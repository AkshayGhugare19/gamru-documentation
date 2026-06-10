import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Coins,
  Gift,
  KeyRound,
  Rocket,
  Target,
  Trophy,
  UserPlus,
} from 'lucide-react'
import { GUIDES } from '../data/guides'

export const GUIDE_ICONS = {
  KeyRound,
  UserPlus,
  Rocket,
  BarChart3,
  Target,
  Gift,
  Coins,
  Trophy,
}

export default function GuidesPage() {
  return (
    <div>
      {/* hero */}
      <div className="not-prose overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-brand-500/10 dark:to-slate-900/40 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
          <BookOpen size={13} /> Guides
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Use Gamru in your platform
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
          Task-focused recipes for integrating the gamification engine. Each one is a single job — copy the code,
          adapt the ids, ship it. Start with setup, then add XP, levels, missions and rewards as you need them.
        </p>
      </div>

      {/* recipe cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {GUIDES.map((g, i) => {
          const Icon = GUIDE_ICONS[g.icon] || BookOpen
          return (
            <Link
              key={g.id}
              to={`/guides/${g.id}`}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/40"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-600/5 text-brand-600 dark:text-brand-300">
                <Icon size={20} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {String(i + 1).padStart(2, '0')} · {g.tag}
                  </span>
                </div>
                <h2 className="mt-0.5 font-semibold text-slate-900 transition group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
                  {g.title}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{g.summary}</p>
              </div>
              <ArrowRight
                size={16}
                className="ml-auto mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500"
              />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
