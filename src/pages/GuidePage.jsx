import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChevronRight, GitBranch, Lightbulb } from 'lucide-react'
import { GUIDES, guideById } from '../data/guides'
import { endpointById } from '../data/endpoints'
import { flowById } from '../data/flows'
import { CodeBlock, MethodBadge } from '../components/primitives'
import { GUIDE_ICONS } from './GuidesPage'

export default function GuidePage() {
  const { id } = useParams()
  const guide = guideById(id)

  if (!guide) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Guide not found</h1>
        <Link to="/guides" className="mt-6 inline-flex items-center gap-1.5 text-brand-600 hover:underline dark:text-brand-400">
          <ArrowLeft size={15} /> Back to guides
        </Link>
      </div>
    )
  }

  const Icon = GUIDE_ICONS[guide.icon] || Lightbulb
  const idx = GUIDES.findIndex((g) => g.id === id)
  const prev = GUIDES[idx - 1]
  const next = GUIDES[idx + 1]
  const flow = guide.flow ? flowById(guide.flow) : null

  return (
    <div>
      {/* breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
        <Link to="/guides" className="transition hover:text-brand-600 dark:hover:text-brand-400">
          Guides
        </Link>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="font-medium text-slate-700 dark:text-slate-200">{guide.title}</span>
      </nav>

      {/* header */}
      <div className="flex items-start gap-4">
        <span className="mt-1 hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30 ring-1 ring-white/20 sm:flex">
          <Icon size={22} />
        </span>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            {guide.tag}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{guide.title}</h1>
          <p className="mt-2 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">{guide.intro}</p>
        </div>
      </div>

      {/* prerequisites */}
      {guide.prerequisites && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
            <Lightbulb size={15} /> Before you start
          </div>
          <ul className="ml-6 list-disc space-y-1 text-sm text-amber-800/90 dark:text-amber-200/80">
            {guide.prerequisites.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {/* steps */}
      <div className="mt-8 space-y-8">
        {guide.steps.map((step, i) => (
          <section key={step.title} className="border-l-2 border-brand-200 pl-6 dark:border-brand-500/30">
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{step.title}</h2>
            </div>
            <p className="leading-7 text-slate-600 dark:text-slate-300">{step.body}</p>

            {step.code && (
              <div className="my-4">
                <CodeBlock label={step.code.label} code={step.code.code} />
              </div>
            )}

            {step.endpoints && step.endpoints.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="self-center text-xs uppercase tracking-wider text-slate-400">Uses</span>
                {step.endpoints.map((eid) => {
                  const ep = endpointById(eid)
                  if (!ep) return null
                  return (
                    <Link
                      key={eid}
                      to={`/api/${ep.platform}/${ep.id}`}
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

      {/* related flow deep-dive */}
      {flow && (
        <Link
          to={`/flows/${flow.id}`}
          className="group mt-10 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-brand-500/40"
        >
          <GitBranch size={18} className="shrink-0 text-brand-600 dark:text-brand-400" />
          <span className="min-w-0">
            <span className="block text-xs uppercase tracking-wider text-slate-400">Go deeper</span>
            <span className="font-medium text-slate-800 dark:text-slate-100">
              See the full “{flow.title}” flow end-to-end
            </span>
          </span>
          <ArrowRight size={16} className="ml-auto shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
        </Link>
      )}

      {/* prev / next */}
      <div className="mt-10 grid gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:grid-cols-2">
        {prev ? (
          <Link
            to={`/guides/${prev.id}`}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-brand-300 dark:border-slate-800 dark:hover:border-brand-500/40"
          >
            <ArrowLeft size={18} className="shrink-0 text-slate-400 transition group-hover:-translate-x-0.5 group-hover:text-brand-600" />
            <span className="min-w-0">
              <span className="block text-xs uppercase tracking-wider text-slate-400">Previous</span>
              <span className="truncate font-medium text-slate-800 dark:text-slate-100">{prev.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/guides/${next.id}`}
            className="group flex items-center justify-end gap-3 rounded-xl border border-slate-200 p-4 text-right transition hover:border-brand-300 dark:border-slate-800 dark:hover:border-brand-500/40"
          >
            <span className="min-w-0">
              <span className="block text-xs uppercase tracking-wider text-slate-400">Next</span>
              <span className="truncate font-medium text-slate-800 dark:text-slate-100">{next.title}</span>
            </span>
            <ArrowRight size={18} className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  )
}
