import { useState } from 'react'
import { Zap } from 'lucide-react'
import { EVENTS } from '../data/events'
import { CodeBlock } from './primitives'

const j = (o) => JSON.stringify(o, null, 2)

const CATEGORY_STYLES = {
  Lifecycle: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  Wallet: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  Gameplay: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  Progression: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
}

// Full-width reference shown under POST /api/integration/events: every event_type
// the engine accepts, what it drives, and a live example payload per event.
export default function EventsReference() {
  const [active, setActive] = useState(EVENTS[0].type)
  const current = EVENTS.find((e) => e.type === active) || EVENTS[0]

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Zap size={16} />
        </span>
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">All event types</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Every value <code className="rounded bg-slate-100 px-1 font-mono text-[0.85em] text-brand-700 dark:bg-slate-800 dark:text-brand-300">event_type</code> can take. Click a row to see its payload.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* event table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Event type</th>
                <th className="px-3 py-2 font-semibold">Drives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {EVENTS.map((e) => {
                const isActive = e.type === active
                return (
                  <tr
                    key={e.type}
                    onClick={() => setActive(e.type)}
                    className={`cursor-pointer align-top transition ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-500/10'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <div className="font-mono text-[13px] font-medium text-brand-700 dark:text-brand-300">
                        {e.type}
                      </div>
                      <span
                        className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          CATEGORY_STYLES[e.category] || CATEGORY_STYLES.Lifecycle
                        }`}
                      >
                        {e.category}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[13px] text-slate-600 dark:text-slate-300">{e.drives}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* live example for the selected event */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white">{current.type}</span> — {current.action}
          </p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {current.fields.map((f) => (
              <span
                key={f}
                className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {f}
              </span>
            ))}
          </div>
          <CodeBlock label={`${current.type} · request body`} code={j(current.example)} />
        </div>
      </div>
    </div>
  )
}
