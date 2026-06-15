import { Link } from 'react-router-dom'
import {
  ArrowRight,
  LayoutTemplate,
  Code2,
  ShieldCheck,
  MousePointerClick,
  Target,
  Trophy,
  Coins,
  Gift,
  Megaphone,
  BarChart3,
  User,
  Activity,
  TrendingUp,
  Sparkles,
  CircleUser,
  Shield,
  AlertTriangle,
  ChevronDown,
  Layers,
  Crown,
  Star,
  Info,
} from 'lucide-react'
import { CodeBlock } from '../../components/primitives'
import {
  PAGE_WIDGETS,
  INLINE_WIDGETS,
  QUICK_START,
  FULL_EXAMPLE,
  SCRIPT_EMBED,
  IFRAME_EMBED,
  REACT_EMBED,
  SCRIPT_ATTRS,
  ELEMENT_ATTRS,
  VALIDATION_ERRORS,
} from '../../data/widgets'

const ICONS = {
  Target,
  Trophy,
  Coins,
  Gift,
  Megaphone,
  BarChart3,
  User,
  Activity,
  TrendingUp,
  Sparkles,
  CircleUser,
  Shield,
}

// One copyable line per widget type, mirroring the Gamanza "show me the code" cards.
function snippetFor(type) {
  return `<div class="gamification_widget" data-type="${type}"></div>`
}

function AttrTable({ rows }) {
  return (
    <div className="not-prose mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
          <tr>
            <th className="px-3 py-2 font-semibold">Attribute</th>
            <th className="px-3 py-2 font-semibold">Required</th>
            <th className="px-3 py-2 font-semibold">What it does</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((f) => (
            <tr key={f.name} className="align-top">
              <td className="whitespace-nowrap px-3 py-2 font-mono text-[13px] text-brand-700 dark:text-brand-300">
                {f.name}
              </td>
              <td className="px-3 py-2 text-xs">
                {f.required ? (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 font-medium text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                    required
                  </span>
                ) : (
                  <span className="text-slate-400">optional</span>
                )}
              </td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{f.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// --- tiny building blocks for the mock UI previews -------------------------
function StatTile({ icon, label, value }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-2.5 dark:border-slate-700 dark:bg-slate-900">
      <span className="text-brand-500">{icon}</span>
      <span className="flex items-center gap-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label} <Info size={9} className="opacity-60" />
      </span>
      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{value}</span>
    </div>
  )
}

function Bar({ pct = 60, children }) {
  return (
    <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
        style={{ width: `${pct}%` }}
      />
      {children && (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
          {children}
        </span>
      )}
    </div>
  )
}

function Chip({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200',
    brand: 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-200',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
  }
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tones[tone]}`}>{children}</span>
}

function Btn({ children }) {
  return (
    <span className="rounded-md bg-gradient-to-r from-brand-500 to-brand-700 px-2.5 py-1 text-[10px] font-bold text-white">
      {children}
    </span>
  )
}

// --- the rendered-UI mock for each widget type -----------------------------
function WidgetPreview({ type }) {
  switch (type) {
    case 'points':
      return (
        <div className="mx-auto max-w-xs space-y-2">
          <div className="flex gap-2">
            <StatTile icon={<Layers size={16} />} label="Level" value="1" />
            <StatTile icon={<Crown size={16} />} label="Rank" value="Initial" />
            <StatTile icon={<Coins size={16} />} label="Tokens" value="50" />
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-1.5 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <Star size={13} className="text-brand-500" /> XP Points
            </div>
            <Bar pct={30}>50</Bar>
            <div className="mt-1.5 flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold">150XP to next rank</span>
              <span>Member</span>
            </div>
          </div>
        </div>
      )
    case 'avatar':
      return (
        <div className="flex justify-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-brand-500 to-brand-300 p-[3px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-2xl dark:bg-slate-900">
                🧑
              </div>
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
              7
            </span>
          </div>
        </div>
      )
    case 'tokens':
      return (
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <Coins size={15} className="text-amber-500" /> 320 Tokens
          </span>
        </div>
      )
    case 'badge-level':
      return (
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-brand-500 to-brand-700 px-2.5 py-1 text-xs font-extrabold text-white shadow">
            <Shield size={12} /> LVL 7
          </span>
        </div>
      )
    case 'mission':
      return (
        <div className="mx-auto max-w-xs overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="flex h-16 items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700 text-2xl">
            🎯
          </div>
          <div className="space-y-1.5 p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Spin Master</span>
              <Chip tone="amber">VIP</Chip>
            </div>
            <Bar pct={40}>4 / 10</Bar>
            <div className="flex items-center justify-between">
              <Chip tone="slate">⏱ 7 days</Chip>
              <Chip tone="brand">🎁 50 XP</Chip>
            </div>
          </div>
        </div>
      )
    case 'tournament':
      return (
        <div className="mx-auto max-w-xs space-y-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Weekend Race</span>
            <Chip tone="emerald">Live</Chip>
          </div>
          {[
            ['1', 'Ace', '4,200'],
            ['2', 'You', '3,900'],
            ['3', 'Nova', '3,100'],
          ].map(([r, n, p]) => (
            <div
              key={r}
              className={`flex items-center justify-between rounded-md px-2 py-1 text-xs ${
                n === 'You' ? 'bg-brand-50 font-bold dark:bg-brand-500/15' : ''
              }`}
            >
              <span className="text-slate-500">#{r}</span>
              <span className="flex-1 px-2 text-slate-700 dark:text-slate-200">{n}</span>
              <span className="font-mono text-slate-600 dark:text-slate-300">{p}</span>
            </div>
          ))}
        </div>
      )
    case 'reward-shop':
      return (
        <div className="mx-auto grid max-w-xs grid-cols-2 gap-2">
          {[
            ['XP Booster', '100'],
            ['Free Spin', '50'],
          ].map(([n, p]) => (
            <div
              key={n}
              className="space-y-1.5 rounded-lg border border-slate-200 bg-white p-2.5 text-center dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="text-xl">🎁</div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{n}</div>
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-600">
                <Coins size={11} /> {p}
              </div>
              <Btn>Buy</Btn>
            </div>
          ))}
        </div>
      )
    case 'rewards':
      return (
        <div className="mx-auto max-w-xs space-y-2">
          {[
            ['Bonus Cash $10', 'claim'],
            ['5 Free Spins', 'claimed'],
          ].map(([n, state]) => (
            <div
              key={n}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <Gift size={14} className="text-brand-500" /> {n}
              </span>
              {state === 'claim' ? <Btn>Claim</Btn> : <Chip tone="emerald">Claimed</Chip>}
            </div>
          ))}
        </div>
      )
    case 'campaign':
      return (
        <div className="mx-auto max-w-xs space-y-1.5">
          {['🎉 Welcome bonus credited', '⬆️ You reached Silver rank', '🎁 Weekend reward unlocked'].map((l) => (
            <div
              key={l}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              {l}
            </div>
          ))}
        </div>
      )
    case 'rankings':
      return (
        <div className="mx-auto max-w-xs space-y-1.5">
          {['Bronze', 'Silver', 'Gold', 'Platinum'].map((r) => (
            <div
              key={r}
              className={`flex items-center justify-between rounded-md px-3 py-1.5 text-xs ${
                r === 'Silver'
                  ? 'bg-brand-50 font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-200'
                  : 'border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Crown size={13} /> {r}
              </span>
              {r === 'Silver' && <Chip tone="brand">You</Chip>}
            </div>
          ))}
        </div>
      )
    case 'profile':
      return (
        <div className="mx-auto flex max-w-xs items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-brand-500 to-brand-300 text-xl">
            🧑
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">Jane · Level 7</div>
            <div className="mb-1 text-[11px] text-slate-500">Silver · 320 tokens</div>
            <Bar pct={62} />
          </div>
        </div>
      )
    case 'status':
      return (
        <div className="mx-auto flex max-w-xs items-center justify-between gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-900">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
            <Crown size={13} className="text-brand-500" /> Silver
          </span>
          <div className="w-20">
            <Bar pct={62} />
          </div>
          <span className="text-[11px] text-slate-500">62%</span>
        </div>
      )
    case 'progress':
      return (
        <div className="mx-auto max-w-xs space-y-1.5 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            <span>1240 / 1500 XP</span>
            <span>Level 7</span>
          </div>
          <Bar pct={82} />
          <div className="text-[10px] text-slate-500">260 XP to the next rank</div>
        </div>
      )
    default:
      return null
  }
}

export function WidgetExample({ w }) {
  const Icon = ICONS[w.icon] || Code2
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-600/5 text-brand-600 dark:text-brand-300">
          <Icon size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white">{w.label}</h3>
          <code className="font-mono text-xs text-slate-400">data-type=&quot;{w.type}&quot;</code>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-2">
        {/* left: description + "show me the code!" */}
        <div>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{w.desc}</p>
          <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50/70 p-3 dark:border-sky-500/20 dark:bg-sky-500/5">
            <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-sky-700 dark:text-sky-300">
              <ChevronDown size={15} /> Show me the code!
            </div>
            <CodeBlock code={snippetFor(w.type)} />
          </div>
        </div>

        {/* right: rendered UI mock */}
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">UI</div>
          <div className="flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
            <div className="w-full">
              <WidgetPreview type={w.type} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function WidgetsGuide() {
  return (
    <div>
      {/* hero */}
      <div className="not-prose overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-brand-500/10 dark:to-slate-900/40 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
          <LayoutTemplate size={13} /> Frontend integration · Widgets
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Embed gamification with one line of HTML
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
          Widgets are gamru features packaged as drop-in iframes. Instead of calling the API and building UI,
          you paste a <code>&lt;div class="gamification_widget"&gt;</code> where you want a feature and include
          the loader script once. The widget self-sizes, validates itself, and renders the player’s live data —
          missions, rewards, the token shop, rank, XP and more. No API plumbing on the page.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <MousePointerClick size={14} className="text-brand-500" /> One tag per feature
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <ShieldCheck size={14} className="text-brand-500" /> Validated & scoped by your auth key
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <Code2 size={14} className="text-brand-500" /> 13 widget types
          </span>
        </div>
      </div>

      {/* QUICK START — plain English, 4 steps */}
      <div className="mt-10">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            Start here
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Set up a widget in 4 simple steps
          </h2>
        </div>
        <p className="mt-2 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
          New to widgets? Follow these four steps in order. No installing, no coding an API — just copy, paste,
          and refresh.
        </p>

        <div className="mt-6 space-y-4">
          {QUICK_START.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-base font-bold text-white shadow">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.plain}</p>
                  {step.code && (
                    <div className="mt-3">
                      <CodeBlock label={step.codeLabel} code={step.code} />
                    </div>
                  )}
                  {step.note && (
                    <p className="mt-3 inline-flex items-start gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <Info size={13} className="mt-px shrink-0" /> {step.note}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* the whole thing together */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/50">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Everything together (copy this)
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Here is a full, working page that shows the player’s points and missions. Swap in your own Auth Key
            and email.
          </p>
          <div className="mt-3">
            <CodeBlock label="a complete example" code={FULL_EXAMPLE} />
          </div>
        </div>
      </div>

      {/* how it works — simple */}
      <div className="doc-content mt-10">
        <h2>What is actually happening?</h2>
        <p>
          You don’t need to know this to use widgets — but here’s the short version. The script you added looks
          for your <code>&lt;div class="gamification_widget"&gt;</code> tags and turns each one into a small,
          self-resizing frame loaded from Gamru. That frame checks your Auth Key, fetches the player’s data, and
          draws the feature — all on its own. Your page only holds that one script tag; it never stores keys or
          calls any API directly.
        </p>
      </div>

      {/* deeper detail */}
      <h2 className="mt-12 text-xl font-bold text-slate-900 dark:text-white">More ways to embed &amp; full options</h2>
      <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
        The four steps above are all most sites need. The sections below cover the same script in more detail,
        every available setting, and two other ways to embed (a plain iframe, and inside a React app).
      </p>

      {/* step 1 — drop-in script */}
      <div className="mt-8 space-y-8">
        <section className="border-l-2 border-brand-200 pl-6 dark:border-brand-500/30">
          <div className="mb-2 flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              1
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Drop-in script (recommended)
            </h2>
          </div>
          <p className="leading-7 text-slate-600 dark:text-slate-300">
            Include the loader once per page and drop a widget <code>&lt;div&gt;</code> wherever a feature
            should appear. The script tag carries your identity; each div picks a widget by{' '}
            <code>data-type</code>. Add as many widgets as you like — one script powers them all.
          </p>
          <div className="my-4">
            <CodeBlock label="index.html" code={SCRIPT_EMBED} />
          </div>

          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Script tag attributes
          </h3>
          <AttrTable rows={SCRIPT_ATTRS} />

          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Per-widget (&lt;div&gt;) attributes
          </h3>
          <AttrTable rows={ELEMENT_ATTRS} />
        </section>

        {/* step 2 — raw iframe */}
        <section className="border-l-2 border-brand-200 pl-6 dark:border-brand-500/30">
          <div className="mb-2 flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              2
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Raw iframe (no script)</h2>
          </div>
          <p className="leading-7 text-slate-600 dark:text-slate-300">
            For a single widget, or a CMS that strips scripts, embed the iframe directly. Pass your identity as
            query params and add <code>embed=1</code> to render the widget bare (transparent, no chrome).
          </p>
          <div className="my-4">
            <CodeBlock label="raw iframe" code={IFRAME_EMBED} />
          </div>
        </section>

        {/* step 3 — SPA */}
        <section className="border-l-2 border-brand-200 pl-6 dark:border-brand-500/30">
          <div className="mb-2 flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              3
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">In a React / SPA app</h2>
          </div>
          <p className="leading-7 text-slate-600 dark:text-slate-300">
            Single-page apps render markup after the loader has already scanned. Call the exposed{' '}
            <code>window.GamruWidgets.scan()</code> hook after a route change or render so newly-added widgets
            mount.
          </p>
          <div className="my-4">
            <CodeBlock label="GamificationWidget.jsx" code={REACT_EMBED} />
          </div>
        </section>
      </div>

      {/* widget catalog — page widgets */}
      <h2 className="mt-12 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Widget types
      </h2>
      <p className="mt-2 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
        Thirteen widgets, all embedded the same way — only <code>data-type</code> changes. Nine{' '}
        <strong>page widgets</strong> render a full feature block; four <strong>inline widgets</strong> are
        compact stat chips you can place anywhere (a header, next to a username).
      </p>

      <h3 className="mt-8 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
        <LayoutTemplate size={18} className="text-brand-500" /> Page widgets
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Each card shows the exact HTML to paste and a preview of what it renders.
      </p>
      <div className="mt-4 space-y-5">
        {PAGE_WIDGETS.map((w) => (
          <WidgetExample key={w.type} w={w} />
        ))}
      </div>

      <h3 className="mt-10 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
        <Sparkles size={18} className="text-brand-500" /> Inline data widgets
      </h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Compact chips that shrink-wrap their content — drop them in a header or beside a username.
      </p>
      <div className="mt-4 space-y-5">
        {INLINE_WIDGETS.map((w) => (
          <WidgetExample key={w.type} w={w} />
        ))}
      </div>

      {/* troubleshooting — plain English, no endpoints */}
      <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-500/20 dark:bg-amber-500/5">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
          <AlertTriangle size={18} className="text-amber-500" /> Widget not showing? Quick fixes
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          A widget checks your Auth Key on its own before it appears. If it doesn’t show, you’ll see a short
          message in its place — here’s what each one means and how to fix it:
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-amber-200/70 bg-white dark:border-amber-500/20 dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {VALIDATION_ERRORS.map((e) => (
                <tr key={e.msg} className="align-top">
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-[13px] text-amber-700 dark:text-amber-300">
                    {e.msg}
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{e.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Most of these are set by your Gamru admin (turning a widget on/off, expiry, allowed websites). If you
          see one you can’t fix from your side, just ask them to check the widget’s settings.
        </p>
      </div>

      {/* footer pointer — back to the simple stuff */}
      <Link
        to="/user/widgets"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="group mt-12 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-brand-500/40"
      >
        <span className="min-w-0">
          <span className="block text-xs uppercase tracking-wider text-slate-400">Recap</span>
          <span className="font-medium text-slate-800 dark:text-slate-100">
            Add the script once, paste a &lt;div&gt; per widget, refresh — that’s it.
          </span>
        </span>
        <ArrowRight size={16} className="ml-auto shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
      </Link>
    </div>
  )
}
