import { Link } from 'react-router-dom'
import {
  ArrowRight,
  User,
  UserPlus,
  LayoutDashboard,
  Target,
  Layers,
  Trophy,
  Gift,
  Coins,
  Rocket,
} from 'lucide-react'
import { MethodBadge } from '../../components/primitives'
import { endpointById } from '../../data/endpoints'

// The player journey, in the order a user actually experiences it. Each step
// says what the USER does/sees and the real Gamru call behind it.
const JOURNEY = [
  {
    icon: UserPlus,
    title: 'Register',
    does: 'The user signs up on your platform. You mirror them into Gamru with one call — it creates the Gamru user AND their player profile together.',
    sees: 'Their account now exists in Gamru, ready to earn.',
    endpoint: 'gamru-users-add',
  },
  {
    icon: LayoutDashboard,
    title: 'See their profile & progress',
    does: 'You read the whole snapshot by email. One call returns level, rank, XP and percent-to-next — plus everything below.',
    sees: 'A progression header: “Level 7 · Silver · 1240 XP · 62% to next rank”.',
    endpoint: 'gamru-players-by-email',
  },
  {
    icon: Rocket,
    title: 'Earn XP, level up & rank up',
    does: 'As the user plays, you award XP. Gamru recomputes their level and rank and hands them back.',
    sees: 'Their XP bar fills; level and rank climb automatically.',
    endpoint: 'gamru-players-add-xp',
  },
  {
    icon: Target,
    title: 'Do missions',
    does: 'Missions arrive on the snapshot with live progress (4/10). When one is COMPLETED, the user taps claim and you forward it.',
    sees: 'A mission list with progress bars and a “Claim” button when done.',
    endpoint: 'gamru-int-missions-claim',
  },
  {
    icon: Layers,
    title: 'Work through mission bundles',
    does: 'Bundles group missions into quests with their own periodicity. Progress (2/5) comes off the same snapshot; each mission is claimed individually.',
    sees: 'Quest cards showing completed/total and a reward when finished.',
    endpoint: 'gamru-players-by-email',
  },
  {
    icon: Trophy,
    title: 'Compete in tournaments',
    does: 'Active tournaments come down on the snapshot. As the user scores, you submit their running points; Gamru ranks everyone.',
    sees: 'A live leaderboard with their position.',
    endpoint: 'gamru-int-tournaments-score',
  },
  {
    icon: Gift,
    title: 'Claim rewards',
    does: 'Rewards land from missions, level-ups and grants, and appear on the snapshot. The user claims; Gamru applies it and records the audit.',
    sees: 'A rewards list with a pending badge and a “Claim” action.',
    endpoint: 'gamru-players-reward-claim',
  },
  {
    icon: Coins,
    title: 'Spend tokens in the reward shop',
    does: 'The shop catalog and the user’s token balance are on the snapshot. A purchase is one atomic call — tokens and stock move together.',
    sees: 'A shop with affordability, and an updated balance after buying.',
    endpoint: 'gamru-players-shop-purchase',
  },
]

export default function UserHome() {
  return (
    <div>
      {/* hero */}
      <div className="not-prose overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-brand-500/10 dark:to-slate-900/40 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
          <User size={13} /> User documentation
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Use Gamru: the player journey
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
          You don’t build a gamification engine — you call Gamru’s API and let your players use it. Below is
          everything a user does, end to end: register, watch their progress, complete missions, compete, and
          claim. Each step shows the real call behind it.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/user/integrate"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700"
          >
            Integrate your platform <ArrowRight size={16} />
          </Link>
          <Link
            to="/user/widgets"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Embed widgets
          </Link>
          <Link
            to="/user/api"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            API — what you call
          </Link>
        </div>
      </div>

      {/* journey timeline */}
      <h2 className="mt-10 text-xl font-bold text-slate-900 dark:text-white">What a user does</h2>
      <div className="mt-5 space-y-3">
        {JOURNEY.map((s, i) => {
          const ep = endpointById(s.endpoint)
          const Icon = s.icon
          return (
            <div
              key={s.title}
              className="relative rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/40"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-600/5 text-brand-600 dark:text-brand-300">
                  <Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-white">{s.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{s.does}</p>
                  <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-600 dark:text-slate-300">They see: </span>
                    {s.sees}
                  </p>
                  {ep && (
                    <Link
                      to={`/user/endpoints/${ep.id}`}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500/40"
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

      {/* footer pointer */}
      <Link
        to="/user/integrate"
        className="group mt-10 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-brand-500/40"
      >
        <span className="min-w-0">
          <span className="block text-xs uppercase tracking-wider text-slate-400">Ready to wire it up?</span>
          <span className="font-medium text-slate-800 dark:text-slate-100">
            Step-by-step integration with real code
          </span>
        </span>
        <ArrowRight size={16} className="ml-auto shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
      </Link>
    </div>
  )
}
