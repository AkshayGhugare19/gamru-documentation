import { Link } from 'react-router-dom'
import { ArrowRight, Plug, ShieldCheck, Boxes } from 'lucide-react'
import { CodeBlock, MethodBadge } from '../components/primitives'
import { SERVICE_STEPS, ENV } from '../data/service'
import { endpointById } from '../data/endpoints'

export default function UseGamruService() {
  return (
    <div>
      {/* hero */}
      <div className="not-prose overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-brand-500/10 dark:to-slate-900/40 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
          <Plug size={13} /> Use Gamru Service
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Integrate your platform with Gamru
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
          Gamru is a hosted gamification service. Plug it into your backend and it manages players, XP, levels,
          ranks, missions, mission bundles, rewards, the token shop and tournaments for you — you never build or
          run an engine. You hold a client key, call the REST API server-to-server, and render what comes back.
          Every call and payload below is the real one — the same paths a typed gamru client hits.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <ShieldCheck size={14} className="text-brand-500" /> One client key authenticates every call
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <Boxes size={14} className="text-brand-500" /> Gamru is the source of truth — you just call it
          </span>
        </div>
      </div>

      {/* mental model */}
      <div className="doc-content mt-8">
        <h2>Before you start</h2>
        <p>
          You need two things from gamru: the <strong>base URL</strong> of the engine and your{' '}
          <strong>client key</strong>. The key identifies your platform — every call carries it as the{' '}
          <code>x-client-auth-key</code> header, and gamru scopes the players and data it returns to your client.
          Keep the key on the server only.
        </p>
        <div className="not-prose my-4">
          <CodeBlock label=".env" code={ENV} />
        </div>
      </div>

      {/* steps */}
      <div className="mt-6 space-y-8">
        {SERVICE_STEPS.map((step, i) => (
          <section key={step.title} className="border-l-2 border-brand-200 pl-6 dark:border-brand-500/30">
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{step.title}</h2>
            </div>
            <p className="leading-7 text-slate-600 dark:text-slate-300">{step.body}</p>

            {[step.code, step.code2, step.code3].filter(Boolean).map((c) => (
              <div key={c.label} className="my-4">
                <CodeBlock label={c.label} code={c.code} />
              </div>
            ))}

            {step.endpoints && step.endpoints.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="self-center text-xs uppercase tracking-wider text-slate-400">Uses</span>
                {step.endpoints.map((eid) => {
                  const ep = endpointById(eid)
                  if (!ep) return null
                  return (
                    <Link
                      key={eid}
                      to={`/user/endpoints/${ep.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500/40"
                    >
                      <MethodBadge method={ep.method} className="scale-90" />
                      <span className="font-mono text-slate-600 dark:text-slate-300">{ep.path}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* next */}
      <Link
        to="/user/api"
        className="group mt-12 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-brand-500/40"
      >
        <span className="min-w-0">
          <span className="block text-xs uppercase tracking-wider text-slate-400">API reference</span>
          <span className="font-medium text-slate-800 dark:text-slate-100">
            Every Gamru endpoint, organized by capability
          </span>
        </span>
        <ArrowRight size={16} className="ml-auto shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
      </Link>
    </div>
  )
}
