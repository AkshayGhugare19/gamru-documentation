import { Link } from 'react-router-dom'
import { Code2, Plug, UserPlus, LayoutDashboard, Rocket, Target, Gift, Coins, Trophy } from 'lucide-react'
import { MethodBadge, AuthBadge } from '../components/primitives'
import { CAPABILITIES } from '../data/service'
import { endpointById } from '../data/endpoints'

const ICONS = { Plug, UserPlus, LayoutDashboard, Rocket, Target, Gift, Coins, Trophy }

export default function GamruServiceApi() {
  return (
    <div>
      {/* hero */}
      <div className="not-prose overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-brand-500/10 dark:to-slate-900/40 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
          <Code2 size={13} /> Gamru API reference
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Every endpoint, by capability
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
          The Gamru API your platform calls, grouped by the job it does. Each capability shows the endpoints,
          when to reach for them, and how they fit together. Every call is server-to-server, authenticated by your{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[13px] dark:bg-slate-800">
            x-client-auth-key
          </code>
          . Click any endpoint for the full request &amp; response.
        </p>
      </div>

      {/* quick jump */}
      <div className="mt-6 flex flex-wrap gap-2">
        {CAPABILITIES.map((c) => {
          const Icon = ICONS[c.icon] || Code2
          return (
            <a
              key={c.key}
              href={`#${c.key}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-500/40 dark:hover:text-brand-300"
            >
              <Icon size={14} className="text-brand-500" />
              {c.title}
            </a>
          )
        })}
      </div>

      {/* capabilities */}
      <div className="mt-8 space-y-10">
        {CAPABILITIES.map((c) => {
          const Icon = ICONS[c.icon] || Code2
          return (
            <section key={c.key} id={c.key} className="scroll-mt-24">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-600/5 text-brand-600 dark:text-brand-300">
                  <Icon size={19} />
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{c.title}</h2>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-300">{c.summary}</p>
                </div>
              </div>

              {/* how to use */}
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
                <span className="font-semibold text-slate-700 dark:text-slate-200">How to use · </span>
                {c.howToUse}
              </div>

              {/* what the snapshot carries */}
              {c.features && c.features.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-xs uppercase tracking-wider text-slate-400">
                    {c.featuresLabel || 'includes'}
                  </span>
                  {c.features.map((f) => (
                    <code
                      key={f}
                      className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-brand-300"
                    >
                      {f}
                    </code>
                  ))}
                </div>
              )}

              {/* endpoints */}
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {c.endpoints.map((eid) => {
                    const ep = endpointById(eid)
                    if (!ep) return null
                    return (
                      <li key={eid}>
                        <Link
                          to={`/user/endpoints/${ep.id}`}
                          className="block px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <div className="flex flex-wrap items-center gap-3">
                            <MethodBadge method={ep.method} />
                            <code className="font-mono text-[13px] text-slate-700 dark:text-slate-200">
                              {ep.path}
                            </code>
                            <span className="ml-auto">
                              <AuthBadge auth={ep.auth} />
                            </span>
                          </div>
                          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{ep.summary}</p>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </section>
          )
        })}
      </div>

      {/* footer pointer */}
      <div className="mt-12 border-t border-slate-200 pt-6 dark:border-slate-800">
        <Link
          to="/user/integrate"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          ← Back to the step-by-step usage guide
        </Link>
      </div>
    </div>
  )
}
