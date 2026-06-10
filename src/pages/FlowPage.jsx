import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CircleDot, Info } from 'lucide-react'
import { FLOWS, flowById } from '../data/flows'
import { endpointById } from '../data/endpoints'
import { CodeBlock, MethodBadge, Pill } from '../components/primitives'

export default function FlowPage() {
  const { id } = useParams()
  const flow = flowById(id)
  if (!flow) {
    return (
      <div className="doc-content">
        <h1 className="text-2xl font-bold">Flow not found</h1>
        <Link to="/">← Back home</Link>
      </div>
    )
  }
  const idx = FLOWS.findIndex((f) => f.id === id)
  const prev = FLOWS[idx - 1]
  const next = FLOWS[idx + 1]

  return (
    <div className="doc-content">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
        <Link to="/" className="hover:text-brand-600">Flows</Link>
        <span>/</span>
        <span>{flow.tag}</span>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{flow.title}</h1>
      <p className="lead text-lg">{flow.intro}</p>

      <div className="not-prose mt-4 flex flex-wrap gap-2">
        {flow.actors.map((a) => (
          <Pill key={a} tone="slate">{a}</Pill>
        ))}
      </div>

      {/* Steps */}
      <h2>Step by step</h2>
      <ol className="not-prose mt-4 space-y-5">
        {flow.steps.map((s, i) => (
          <li key={i} className="relative rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">{s.body}</p>
                {s.endpoints && s.endpoints.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.endpoints.map((eid) => {
                      const ep = endpointById(eid)
                      if (!ep) return null
                      return (
                        <a
                          key={eid}
                          href={`#/api/${ep.platform}#${ep.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-800"
                        >
                          <MethodBadge method={ep.method} />
                          <span className="font-mono text-slate-600 dark:text-slate-300">{ep.path}</span>
                        </a>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {/* Sequence */}
      <h2>Call sequence</h2>
      <p>The compact trace of who calls whom:</p>
      <div className="not-prose my-4">
        <CodeBlock label="sequence" code={flow.sequence.join('\n')} />
      </div>

      {/* Notes */}
      {flow.notes && flow.notes.length > 0 && (
        <>
          <h2>Notes &amp; guarantees</h2>
          <div className="not-prose space-y-2">
            {flow.notes.map((n, i) => (
              <div key={i} className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                <Info size={16} className="mt-0.5 shrink-0" />
                <span>{n}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* prev / next */}
      <div className="not-prose mt-12 flex items-stretch justify-between gap-4 border-t border-slate-200 pt-6 dark:border-slate-800">
        {prev ? (
          <Link to={`/flows/${prev.id}`} className="group flex flex-1 items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-brand-300 dark:border-slate-800">
            <ArrowLeft size={18} className="text-slate-400 group-hover:text-brand-500" />
            <span>
              <span className="block text-xs text-slate-400">Previous</span>
              <span className="font-medium text-slate-800 dark:text-slate-100">{prev.title}</span>
            </span>
          </Link>
        ) : <span className="flex-1" />}
        {next ? (
          <Link to={`/flows/${next.id}`} className="group flex flex-1 items-center justify-end gap-3 rounded-xl border border-slate-200 p-4 text-right hover:border-brand-300 dark:border-slate-800">
            <span>
              <span className="block text-xs text-slate-400">Next</span>
              <span className="font-medium text-slate-800 dark:text-slate-100">{next.title}</span>
            </span>
            <ArrowRight size={18} className="text-slate-400 group-hover:text-brand-500" />
          </Link>
        ) : <span className="flex-1" />}
      </div>
    </div>
  )
}
