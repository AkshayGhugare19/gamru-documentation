import { Link } from 'react-router-dom'
import {
  LayoutTemplate,
  Palette,
  MonitorSmartphone,
  Copy,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'
import { CodeBlock, MethodBadge, AuthBadge, FieldTable } from '../../components/primitives'
import { endpointById } from '../../data/endpoints'
import {
  ADMIN_STEPS,
  CONFIG_FIELDS,
  APPEARANCE_GROUPS,
  PAGE_WIDGETS,
  INLINE_WIDGETS,
  SCRIPT_EMBED,
  IFRAME_EMBED,
} from '../../data/widgets'

const ENDPOINT_IDS = [
  'gamru-widget-configs-list',
  'gamru-widget-configs-create',
  'gamru-widget-configs-update',
  'gamru-widget-configs-toggle',
  'gamru-widget-configs-delete',
]

export default function WidgetsManage() {
  return (
    <div>
      {/* hero */}
      <div className="not-prose overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-rose-50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-rose-500/10 dark:to-slate-900/40 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-rose-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">
          <LayoutTemplate size={13} /> Admin · Widget / iFrame Setup
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Create & manage embeddable widgets
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
          From <strong>Settings → Widget / iFrame Setup</strong> you turn any gamru feature into a drop-in
          widget a client can embed on their site. You pick the client and widget type, control access (status,
          expiry, allowed domains), style the look in a live-preview editor, and hand over a ready-made snippet.
          Each widget is one row in the <code>widget_configurations</code> table.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <ShieldCheck size={14} className="text-rose-500" /> Per-client access control
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <Palette size={14} className="text-rose-500" /> Full theming + live preview
          </span>
        </div>
      </div>

      {/* the walkthrough */}
      <div className="mt-8 space-y-6">
        {ADMIN_STEPS.map((step, i) => (
          <section key={step.title} className="border-l-2 border-rose-200 pl-6 dark:border-rose-500/30">
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{step.title}</h2>
            </div>
            <p className="leading-7 text-slate-600 dark:text-slate-300">{step.body}</p>
          </section>
        ))}
      </div>

      {/* widget types available */}
      <h2 className="mt-12 text-xl font-bold text-slate-900 dark:text-white">Widget types you can create</h2>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        Nine page widgets and four inline data widgets — thirteen <code>type</code> values in all.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Page widgets</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PAGE_WIDGETS.map((w) => (
              <span
                key={w.type}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-800"
              >
                <span className="font-medium text-slate-700 dark:text-slate-200">{w.label}</span>{' '}
                <code className="font-mono text-slate-400">{w.type}</code>
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Inline data widgets</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {INLINE_WIDGETS.map((w) => (
              <span
                key={w.type}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-800"
              >
                <span className="font-medium text-slate-700 dark:text-slate-200">{w.label}</span>{' '}
                <code className="font-mono text-slate-400">{w.type}</code>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* config record */}
      <h2 className="mt-12 text-xl font-bold text-slate-900 dark:text-white">The widget configuration</h2>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        Every widget you create is a record with these fields. <code>status</code>, <code>expiry_date</code> and{' '}
        <code>allowed_domains</code> are enforced by the public validate route the embed calls on every render.
      </p>
      <FieldTable title="widget_configurations" fields={CONFIG_FIELDS} />

      {/* appearance editor */}
      <h2 className="mt-12 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
        <Palette size={20} className="text-rose-500" /> The appearance editor
      </h2>
      <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
        Create / Edit opens a full-page editor: a form on the left, a{' '}
        <span className="inline-flex items-center gap-1 font-medium">
          <MonitorSmartphone size={14} /> sticky live preview
        </span>{' '}
        on the right with a desktop/mobile toggle. The preview is token-driven and renders your real catalog, so
        what you see is what the embed shows. Everything lands in the <code>appearance</code> JSONB blob:
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {APPEARANCE_GROUPS.map((g) => (
          <div
            key={g.title}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{g.title}</h3>
            <ul className="mt-2 space-y-1">
              {g.fields.map((f) => (
                <li key={f} className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* the snippet you hand over */}
      <h2 className="mt-12 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
        <Copy size={20} className="text-rose-500" /> The snippet you hand over
      </h2>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        Each saved widget shows two copy-ready snippets. Hand the developer whichever fits their site; they only
        swap in the player’s email.
      </p>
      <div className="mt-4 space-y-4">
        <CodeBlock label="drop-in script + div" code={SCRIPT_EMBED} />
        <CodeBlock label="raw iframe" code={IFRAME_EMBED} />
      </div>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        The full frontend embedding guide (attributes, SPA usage, the type catalog) lives on the{' '}
        <Link to="/user/widgets" className="font-semibold text-rose-600 hover:underline dark:text-rose-400">
          User → Frontend integration
        </Link>{' '}
        page — share it with whoever installs the widget.
      </p>

      {/* endpoints */}
      <h2 className="mt-12 text-xl font-bold text-slate-900 dark:text-white">Endpoints</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {ENDPOINT_IDS.map((id) => {
            const ep = endpointById(id)
            if (!ep) return null
            return (
              <li key={id}>
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
            )
          })}
        </ul>
      </div>

      {/* footer pointer */}
      <Link
        to="/admin/api"
        className="group mt-12 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-rose-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-rose-500/40"
      >
        <span className="min-w-0">
          <span className="block text-xs uppercase tracking-wider text-slate-400">Back to</span>
          <span className="font-medium text-slate-800 dark:text-slate-100">
            Everything you can create &amp; manage
          </span>
        </span>
        <ArrowRight size={16} className="ml-auto shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-rose-500" />
      </Link>
    </div>
  )
}
