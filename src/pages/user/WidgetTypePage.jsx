import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, LayoutTemplate, Info } from 'lucide-react'
import { CodeBlock } from '../../components/primitives'
import { WidgetExample } from './WidgetsGuide'
import { ALL_WIDGETS, widgetByType } from '../../data/widgets'

const LOADER = `<script
  src="https://gamru-frontend.netlify.app/embed.js"
  data-auth-key="ck_live_9f2c..."
  data-email="player@example.com">
</script>`

export default function WidgetTypePage() {
  const { type } = useParams()
  const w = widgetByType(type)

  // Unknown type — send the reader back to the overview.
  if (!w) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-300">That widget doesn’t exist.</p>
        <Link to="/user/widgets" className="mt-3 inline-block font-semibold text-brand-600 hover:underline">
          ← Back to all widgets
        </Link>
      </div>
    )
  }

  // Order siblings the same way the sidebar lists them, for prev / next.
  const idx = ALL_WIDGETS.findIndex((x) => x.type === w.type)
  const prev = ALL_WIDGETS[idx - 1]
  const next = ALL_WIDGETS[idx + 1]

  const full = `<!-- Paste this where the widget should appear -->
<div class="gamification_widget" data-type="${w.type}"></div>

<!-- And include this loader once on the page (before </body>) -->
${LOADER}`

  return (
    <div>
      {/* breadcrumb */}
      <Link
        to="/user/widgets"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-brand-600 dark:text-slate-400"
      >
        <ArrowLeft size={15} /> All widgets
      </Link>

      {/* hero */}
      <div className="not-prose mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-brand-500/10 dark:to-slate-900/40 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
          <LayoutTemplate size={13} /> Widget
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{w.label}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">{w.desc}</p>
      </div>

      {/* the example — code + UI, exactly like the catalog */}
      <div className="mt-8">
        <WidgetExample w={w} />
      </div>

      {/* how to use it */}
      <h2 className="mt-10 text-xl font-bold text-slate-900 dark:text-white">How to use it</h2>
      <ol className="mt-3 space-y-2 text-slate-600 dark:text-slate-300">
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
            1
          </span>
          <span>
            Paste the <code className="rounded bg-slate-100 px-1 font-mono text-sm dark:bg-slate-800">&lt;div&gt;</code>{' '}
            above wherever you want the <strong>{w.label}</strong> widget to show.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
            2
          </span>
          <span>Add the loader script once on the page, with your Auth Key and the logged-in user’s email.</span>
        </li>
        <li className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
            3
          </span>
          <span>Refresh — the widget renders itself with live data.</span>
        </li>
      </ol>

      <div className="mt-5">
        <CodeBlock label="full example" code={full} />
      </div>

      <p className="mt-3 inline-flex items-start gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
        <Info size={13} className="mt-px shrink-0" /> Already added the loader for another widget? Then you only
        need the one <code className="mx-0.5 font-mono">&lt;div&gt;</code> line — not the script again.
      </p>

      {/* prev / next */}
      <div className="mt-12 flex items-center justify-between gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
        {prev ? (
          <Link
            to={`/user/widgets/${prev.type}`}
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-600 dark:text-slate-400"
          >
            <ArrowLeft size={15} className="transition group-hover:-translate-x-0.5" />
            {prev.label}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/user/widgets/${next.type}`}
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-600 dark:text-slate-400"
          >
            {next.label}
            <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  )
}
