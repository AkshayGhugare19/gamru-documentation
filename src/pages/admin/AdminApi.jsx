import { Link } from 'react-router-dom'
import {
  UserCog,
  KeyRound,
  Boxes,
  Users,
  Sparkles,
  Trophy,
  Megaphone,
  Filter,
  Mail,
  Zap,
  Gauge,
  BellOff,
  BarChart3,
  Database,
  Settings,
  Image,
  LayoutTemplate,
  Server,
} from 'lucide-react'
import { MethodBadge, AuthBadge } from '../../components/primitives'
import { groupsFor } from '../../data/endpoints'
import { ADMIN_GROUP_META } from '../../data/admin'

const ICONS = {
  KeyRound,
  Boxes,
  Users,
  Sparkles,
  Trophy,
  Megaphone,
  Filter,
  Mail,
  Zap,
  Gauge,
  BellOff,
  BarChart3,
  Database,
  Settings,
  Image,
  LayoutTemplate,
}

function slug(s) {
  return 'grp-' + s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminApi() {
  const groups = groupsFor('gamru', 'admin')

  return (
    <div>
      {/* hero */}
      <div className="not-prose overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-rose-50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-rose-500/10 dark:to-slate-900/40 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-rose-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">
          <UserCog size={13} /> Manage by resource
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Everything you can create & manage
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
          Each resource below is something operators own. Create, update, archive and delete — the endpoints are
          grouped by resource with a short note on what they manage. Click any endpoint for the full request &amp;
          response. Most require an operator JWT.
        </p>
      </div>

      {/* quick jump */}
      <div className="mt-6 flex flex-wrap gap-2">
        {groups.map((g) => {
          const Icon = ICONS[ADMIN_GROUP_META[g.group]?.icon] || Server
          return (
            <a
              key={g.group}
              href={`#${slug(g.group)}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-rose-300 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-rose-500/40 dark:hover:text-rose-300"
            >
              <Icon size={14} className="text-rose-500" />
              {g.group}
            </a>
          )
        })}
      </div>

      {/* resource sections */}
      <div className="mt-8 space-y-10">
        {groups.map((g) => {
          const meta = ADMIN_GROUP_META[g.group] || {}
          const Icon = ICONS[meta.icon] || Server
          return (
            <section key={g.group} id={slug(g.group)} className="scroll-mt-24">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/15 to-rose-600/5 text-rose-600 dark:text-rose-300">
                  <Icon size={19} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{g.group}</h2>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {g.items.length}
                    </span>
                  </div>
                  {meta.note && <p className="mt-1 text-slate-600 dark:text-slate-300">{meta.note}</p>}
                </div>
              </div>

              {meta.features && meta.features.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-xs uppercase tracking-wider text-slate-400">:feature ∈</span>
                  {meta.features.map((f) => (
                    <code
                      key={f}
                      className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs text-rose-700 dark:border-slate-700 dark:bg-slate-900 dark:text-rose-300"
                    >
                      {f}
                    </code>
                  ))}
                </div>
              )}

              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {g.items.map((ep) => (
                    <li key={ep.id}>
                      <Link
                        to={`/admin/endpoints/${ep.id}`}
                        className="block px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <MethodBadge method={ep.method} />
                          <code className="font-mono text-[13px] text-slate-700 dark:text-slate-200">{ep.path}</code>
                          <span className="ml-auto">
                            <AuthBadge auth={ep.auth} />
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{ep.summary}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
