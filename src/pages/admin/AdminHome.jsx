import { Link } from 'react-router-dom'
import { ArrowRight, UserCog, Sparkles, Megaphone, Boxes, Settings, LayoutTemplate } from 'lucide-react'
import { groupsFor } from '../../data/endpoints'

const HIGHLIGHTS = [
  {
    icon: Sparkles,
    title: 'Build the gamification',
    blurb:
      'Create and edit missions, mission bundles, ranks, XP & token rules, the reward-shop catalog and tournaments — all through one CRUD router.',
  },
  {
    icon: Megaphone,
    title: 'Run lifecycle CRM',
    blurb: 'Define segments, author templates, set triggers and frequency caps, and launch campaigns with analytics.',
  },
  {
    icon: Boxes,
    title: 'Onboard consumer platforms',
    blurb: 'Register clients and hand out the auth_key each platform uses to call Gamru. Rotate or disable keys anytime.',
  },
  {
    icon: Settings,
    title: 'Tune the engine',
    blurb: 'Manage panel settings, casino/sport catalogs and media assets that the whole platform draws from.',
  },
  {
    icon: LayoutTemplate,
    title: 'Build embeddable widgets',
    blurb: 'Turn any feature into a drop-in iframe widget: pick a client + type, control status / expiry / domains, theme it in a live preview, and hand over the snippet.',
    to: '/admin/widgets',
  },
]

export default function AdminHome() {
  const adminGroupCount = groupsFor('gamru', 'admin').length
  return (
    <div>
      {/* hero */}
      <div className="not-prose overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-rose-50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-rose-500/10 dark:to-slate-900/40 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-rose-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">
          <UserCog size={13} /> Admin documentation
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Manage everything in Gamru
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
          The admin side is the operator console. You create, update and delete everything your users experience —
          missions, ranks, rewards, tournaments — and run the CRM that markets to them. These endpoints use an
          operator JWT (log in, then send the bearer token).
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/admin/api"
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-700"
          >
            Manage by resource <ArrowRight size={16} />
          </Link>
          <Link
            to="/admin/endpoints"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            All admin endpoints
          </Link>
        </div>
      </div>

      {/* highlights */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {HIGHLIGHTS.map((h) => {
          const Icon = h.icon
          const inner = (
            <>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/15 to-rose-600/5 text-rose-600 dark:text-rose-300">
                <Icon size={20} />
              </span>
              <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">{h.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{h.blurb}</p>
            </>
          )
          return h.to ? (
            <Link
              key={h.title}
              to={h.to}
              className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-rose-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-500/40"
            >
              {inner}
            </Link>
          ) : (
            <div
              key={h.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              {inner}
            </div>
          )
        })}
      </div>

      <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
        {adminGroupCount} resource groups · full create / read / update / delete.{' '}
        <Link to="/admin/api" className="font-semibold text-rose-600 hover:underline dark:text-rose-400">
          Browse them →
        </Link>
      </p>
    </div>
  )
}
