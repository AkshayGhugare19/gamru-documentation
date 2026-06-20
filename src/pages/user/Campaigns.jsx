import { Link } from 'react-router-dom'
import { Inbox, MailOpen, MousePointerClick, BellOff, Megaphone, ArrowRight } from 'lucide-react'
import { MethodBadge, AuthBadge, CodeBlock, Pill } from '../../components/primitives'
import { endpointById } from '../../data/endpoints'

// Small clickable endpoint chip → its detail page in the USER panel.
function EndpointLink({ id }) {
  const ep = endpointById(id)
  if (!ep) return null
  return (
    <Link
      to={`/user/endpoints/${ep.id}`}
      className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500/40"
    >
      <MethodBadge method={ep.method} className="scale-90" />
      <span className="font-mono text-slate-600 dark:text-slate-300">{ep.path}</span>
      <AuthBadge auth={ep.auth} />
    </Link>
  )
}

const LIST = `// Read the player's on-site inbox + unread badge count.
// (resolve the player by email — your client key authorises the call)
const res = await fetch(\`\${process.env.GAMRU_BACKEND_URL}/inbox/list\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-client-auth-key': process.env.GAMRU_CLIENT_AUTH_KEY,
  },
  body: JSON.stringify({ email, page: 1, limit: 20 /*, unread_only: true */ }),
})
const { data } = await res.json()
const badge = data.unread_count            // → the inbox bell badge
const messages = data.items                // [{ id, title, body, channel, read, event_label, event_at }]`

const READ = `// Player opens a message → mark it read (clears the badge, records an OPEN).
await fetch(\`\${process.env.GAMRU_BACKEND_URL}/inbox/\${deliveryId}/read\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-client-auth-key': process.env.GAMRU_CLIENT_AUTH_KEY },
  body: JSON.stringify({ email }),
})`

const CLICK = `// Player taps the message CTA → record a CLICK (feeds the campaign funnel).
await fetch(\`\${process.env.GAMRU_BACKEND_URL}/inbox/\${deliveryId}/click\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-client-auth-key': process.env.GAMRU_CLIENT_AUTH_KEY },
  body: JSON.stringify({ email }),
})`

const UNSUB = `// Player opts out of a channel → suppress future deliveries + audit it.
await fetch(\`\${process.env.GAMRU_BACKEND_URL}/inbox/unsubscribe\`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-client-auth-key': process.env.GAMRU_CLIENT_AUTH_KEY },
  body: JSON.stringify({ email, channel: 'ON_SITE', reason: 'Not interested' }),
})`

const TRIGGERS = [
  { event: 'USER_REGISTERED', label: 'Event: Registration', how: 'POST /api/integration/events', when: 'Player signs up — fires any welcome campaign.' },
  { event: 'DEPOSIT_MADE', label: 'Event: First Deposit', how: 'POST /api/integration/events', when: 'A deposit succeeds — fires any first-deposit campaign.' },
  { event: 'LOGIN', label: 'Event: Login', how: 'POST /api/activity (kind:"login")', when: 'Player logs in — fires any login campaign.' },
]

const STEPS = [
  {
    icon: Inbox,
    title: 'LIST — read the inbox',
    body:
      'One call returns the player’s delivered messages and the unread_count for the bell badge. POST so the email travels in the body. Poll it (or refresh on focus) so a campaign delivered mid-session shows up without a reload; pass unread_only to fetch just the unseen ones.',
    code: { label: 'list inbox (Node)', code: LIST },
    endpoints: ['gamru-int-inbox-list'],
  },
  {
    icon: MailOpen,
    title: 'READ — mark a message opened',
    body:
      'When the player views a message, mark it read. GAMRU stamps read_at, clears it from the unread count and records a real OPEN engagement event against the campaign’s analytics.',
    code: { label: 'mark read (Node)', code: READ },
    endpoints: ['gamru-int-inbox-read'],
  },
  {
    icon: MousePointerClick,
    title: 'CLICK — record a CTA tap',
    body:
      'If the message has a call-to-action and the player taps it, record a click. GAMRU marks it read (if not already) and records a CLICK event — the deepest step of the campaign funnel in analytics.',
    code: { label: 'record click (Node)', code: CLICK },
    endpoints: ['gamru-int-inbox-click'],
  },
  {
    icon: BellOff,
    title: 'UNSUBSCRIBE — opt out of a channel',
    body:
      'Give the player a way out. GAMRU flips the matching consent flag off so future deliveries on that channel are suppressed, and writes an unsubscribe report for the operator audit. Defaults to the ON_SITE channel.',
    code: { label: 'unsubscribe (Node)', code: UNSUB },
    endpoints: ['gamru-int-inbox-unsubscribe'],
  },
]

export default function Campaigns() {
  return (
    <div>
      {/* hero */}
      <div className="not-prose overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-brand-500/10 dark:to-slate-900/40 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
          <Megaphone size={13} /> User · Campaigns &amp; Inbox
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Campaign messages in your app
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
          Operators author campaigns in the Gamru console; GAMRU resolves the audience, renders the message and
          delivers it to the player’s <strong className="text-slate-900 dark:text-white">on-site inbox</strong>.
          Your platform does exactly two things: <strong className="text-slate-900 dark:text-white">forward
          events</strong> that may trigger a campaign, and <strong className="text-slate-900 dark:text-white">render
          the inbox</strong> — list, read, click, unsubscribe. The same client-key bridge as missions &amp;
          tournaments.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Pill>Base URL: https://gamru-backend-2.onrender.com/api</Pill>
          <Pill tone="slate">Auth: x-client-auth-key</Pill>
        </div>
      </div>

      {/* mental model */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-300">
            <Megaphone size={18} /> <h3 className="font-semibold text-slate-900 dark:text-white">Trigger</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            A campaign starts either when the operator hits <em>Send now</em>, or when you forward a player event
            that matches its trigger. You only forward the fact — GAMRU decides who gets it and renders it.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-300">
            <Inbox size={18} /> <h3 className="font-semibold text-slate-900 dark:text-white">Inbox</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Delivered messages live in the player’s on-site inbox. You render them and report engagement back —
            read &amp; click feed the campaign’s analytics; unsubscribe suppresses future sends on that channel.
          </p>
        </div>
      </div>

      {/* triggers */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Events that trigger a campaign</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Forward these the same way you forward gameplay. GAMRU maps each to a campaign trigger label and
          delivers any campaign configured with it (and whose segment the player matches).
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Event</th>
                <th className="px-3 py-2 font-semibold">Trigger label</th>
                <th className="px-3 py-2 font-semibold">Forwarded via</th>
                <th className="px-3 py-2 font-semibold">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {TRIGGERS.map((t) => (
                <tr key={t.event} className="align-top">
                  <td className="px-3 py-2 font-mono text-[13px] text-brand-700 dark:text-brand-300">{t.event}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-600 dark:text-slate-300">{t.label}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-500 dark:text-slate-400">{t.how}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{t.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="self-center text-xs uppercase tracking-wider text-slate-400">Trigger hook:</span>
          <EndpointLink id="gamru-integration-events" />
          <EndpointLink id="gamru-int-activity" />
        </div>
      </div>

      {/* the four inbox steps */}
      <h2 className="mt-10 text-xl font-bold text-slate-900 dark:text-white">The four things you do with the inbox</h2>
      <div className="mt-5 space-y-5">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          return (
            <div
              key={s.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-600/5 text-brand-600 dark:text-brand-300">
                  <Icon size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Step {i + 1}</span>
                  <h3 className="mt-0.5 text-lg font-semibold text-slate-900 dark:text-white">{s.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{s.body}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {s.endpoints.map((id) => (
                      <EndpointLink key={id} id={id} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <CodeBlock label={s.code.label} code={s.code.code} />
              </div>
            </div>
          )
        })}
      </div>

      {/* footer pointer */}
      <Link
        to="/user/endpoints"
        className="group mt-10 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-brand-500/40"
      >
        <span className="min-w-0">
          <span className="block text-xs uppercase tracking-wider text-slate-400">Full reference</span>
          <span className="font-medium text-slate-800 dark:text-slate-100">
            Every inbox &amp; trigger endpoint, with request/response in 6 languages
          </span>
        </span>
        <ArrowRight size={16} className="ml-auto shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
      </Link>
    </div>
  )
}
