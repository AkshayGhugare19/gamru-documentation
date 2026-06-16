import { useState } from 'react'
import { Zap, KeyRound, ShieldCheck, Copy, UserSearch, Cog } from 'lucide-react'
import { EVENTS } from '../data/events'
import { CodeBlock } from './primitives'

const j = (o) => JSON.stringify(o, null, 2)

const CATEGORY_STYLES = {
  Lifecycle: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  Wallet: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  Gameplay: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  Progression: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
}

// How the engine processes one inbound event, in order. Shown so a reader
// understands the full job this endpoint performs end-to-end.
const PIPELINE = [
  {
    icon: KeyRound,
    title: 'Authenticate (two keys)',
    body: 'The request must carry x-service-key (the shared service secret) AND x-client-auth-key (your per-client key). A missing/disabled key is rejected with 401 / 403 before anything else runs.',
  },
  {
    icon: ShieldCheck,
    title: 'Validate the body',
    body: 'event_type must be one of the accepted values below; event_id (1–180) and external_id (1–120) are required. A bad shape or unknown event_type returns 400 — nothing is applied.',
  },
  {
    icon: Copy,
    title: 'De-duplicate on event_id',
    body: 'Every event carries a stable event_id. If gamru has already processed that id it is ignored and the response says duplicate:true — so retries (and at-least-once delivery) can never double-count.',
  },
  {
    icon: UserSearch,
    title: 'Resolve the player',
    body: 'The event is attached to a player by (origin, external_id). The link is first established from the email on USER_REGISTERED; every later event with the same external_id resolves to that player automatically.',
  },
  {
    icon: Cog,
    title: 'Apply by type',
    body: 'Each event_type does its own specific work — link the account, apply XP and recompute level/rank, move CRM segments, or record an audit row. See exactly what each one drives in the table below.',
  },
]

// Full-width reference shown under POST /api/integration/events: what the
// endpoint is for, how it processes an event, every event_type it accepts,
// what each drives, and a live example payload per event.
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
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            What this endpoint does &amp; every event type
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The one inbound hook from your platform to the gamru engine — currently handles{' '}
            <strong className="text-slate-700 dark:text-slate-200">{EVENTS.length} event types</strong>.
          </p>
        </div>
      </div>

      {/* purpose */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
        <span className="font-semibold text-slate-900 dark:text-white">Purpose. </span>
        This is the single, one-way channel your platform uses to tell gamru what a player just did. Your backend
        reports a <em>fact</em> — they registered, earned XP, leveled up, ranked up, or made a deposit — and gamru
        <strong className="text-slate-900 dark:text-white"> reacts</strong>: it links the account to a gamru player,
        updates the XP / level / rank progression off the configured ladder, and moves the player between CRM
        segments (e.g. <code className="rounded bg-slate-200 px-1 dark:bg-slate-800">no_deposit → depositor</code>).
        It is fire-and-forget — you tell gamru what happened; gamru does not call you back on this route — and
        idempotent, so it is always safe to retry. It does <strong className="text-slate-900 dark:text-white">not</strong>{' '}
        accept gameplay events like wager/win, and it does not itself author or claim missions.
      </div>

      {/* how it works pipeline */}
      <div className="mb-6">
        <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          How it processes one event
        </h5>
        <ol className="grid gap-2 sm:grid-cols-2">
          {PIPELINE.map((p, i) => {
            const Icon = p.icon
            return (
              <li
                key={p.title}
                className="flex gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-300">
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-slate-900 dark:text-white">
                    <span className="text-slate-400">{i + 1}.</span> {p.title}
                  </div>
                  <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-300">{p.body}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        The {EVENTS.length} accepted event types — click a row to see its payload
      </h5>

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
          <div className="mb-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-600 dark:text-slate-300">meta keys: </span>
            {current.example.meta ? (
              <span className="font-mono text-slate-600 dark:text-slate-300">
                {Object.keys(current.example.meta).join(' · ')}
              </span>
            ) : (
              <span>none — this event needs no meta</span>
            )}
          </div>
          <CodeBlock label={`${current.type} · request body`} code={j(current.example)} />
        </div>
      </div>
    </div>
  )
}
