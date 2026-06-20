import { Link } from 'react-router-dom'
import { Megaphone, Send, Plus, Pencil, Eye, Trash2, UserCog, ArrowRight, Users, FileText, Bell } from 'lucide-react'
import { MethodBadge, AuthBadge, CodeBlock, Pill } from '../../components/primitives'
import { endpointById } from '../../data/endpoints'

// Endpoint chip → detail page in the ADMIN panel.
function EndpointLink({ id }) {
  const ep = endpointById(id)
  if (!ep) return null
  return (
    <Link
      to={`/admin/endpoints/${ep.id}`}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs transition hover:border-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-rose-500/40"
    >
      <MethodBadge method={ep.method} className="scale-90" />
      <span className="font-mono text-slate-600 dark:text-slate-300">{ep.path}</span>
      <AuthBadge auth={ep.auth} />
    </Link>
  )
}

const CAMPAIGN_BODY = `// CREATE a campaign — POST /api/campaigns/add
{
  "name": "Welcome series",
  "status": "IN_DESIGN",          // IN_DESIGN | SCHEDULED | SENT | PAUSED | ARCHIVED
  "channel": "ON_SITE",            // ON_SITE | EMAIL | SMS | WEB_PUSH
  "template_id": "tpl_welcome",    // the rendered message (tokens like {{name}})
  "segment": "depositors",         // who receives it (a saved segment)
  "trigger": "Event: Registration",// fires on this player event (or use Send now)
  "start_date": "2026-06-20T00:00:00Z",
  "tags": ["onboarding"]
}
// An EVENT campaign only delivers once it has BOTH a template_id AND a matching
// segment — a trigger with an empty template silently no-ops.`

const crud = [
  {
    icon: Plus,
    verb: 'CREATE',
    title: 'Create a campaign',
    body: 'POST /api/campaigns/add with name, channel, template, segment and a trigger. Leave it IN_DESIGN while you draft; pick an event trigger or send it manually.',
    ep: 'gamru-campaigns-add',
  },
  {
    icon: Eye,
    verb: 'LIST',
    title: 'List campaigns',
    body: 'GET /api/campaigns/paginate with search, status, trigger, tag and archived filters — the console grid.',
    ep: 'gamru-campaigns-paginate',
  },
  {
    icon: Eye,
    verb: 'GET',
    title: 'Get a campaign',
    body: 'GET /api/campaigns/:id returns one campaign with its channel, template, segment and trigger config.',
    ep: 'gamru-campaigns-get',
  },
  {
    icon: Pencil,
    verb: 'UPDATE',
    title: 'Update a campaign',
    body: 'POST /api/campaigns/update-by/:id to change channel, template, segment, trigger or schedule. Use archive/:id to take it offline without deleting.',
    ep: 'gamru-campaigns-update',
  },
  {
    icon: Trash2,
    verb: 'DELETE',
    title: 'Delete a campaign',
    body: 'DELETE /api/campaigns/:id permanently removes it. Prefer archive when you only want to hide it — delete is irreversible.',
    ep: 'gamru-campaigns-delete',
  },
]

const TRIGGERS = [
  { event: 'USER_REGISTERED', label: 'Event: Registration', when: 'Player signs up.' },
  { event: 'DEPOSIT_MADE', label: 'Event: First Deposit', when: 'A deposit succeeds.' },
  { event: 'LOGIN', label: 'Event: Login', when: 'Player logs in.' },
]

const SUPPORTING = [
  { icon: Users, label: 'Segments', body: 'The audience a campaign targets — STATIC or DYNAMIC rule trees.', ep: 'gamru-segments-add' },
  { icon: FileText, label: 'Templates', body: 'The rendered message per channel, with {{name}}-style tokens.', ep: null, to: '/admin/endpoints' },
  { icon: Bell, label: 'Analytics', body: 'Aggregated sent / delivered / open / click metrics across campaigns.', ep: 'gamru-analytics-campaigns' },
]

export default function Campaigns() {
  return (
    <div>
      {/* hero */}
      <div className="not-prose overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-rose-50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-rose-500/10 dark:to-slate-900/40 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-rose-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">
          <UserCog size={13} /> Admin · Campaigns
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Create &amp; operate campaigns
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
          A campaign binds a <strong className="text-slate-900 dark:text-white">channel</strong> + a{' '}
          <strong className="text-slate-900 dark:text-white">template</strong> + a{' '}
          <strong className="text-slate-900 dark:text-white">segment</strong> + a{' '}
          <strong className="text-slate-900 dark:text-white">trigger</strong>. Author it here; GAMRU resolves the
          audience, renders the message, enforces consent / frequency caps / unsubscribes, and delivers it to each
          player’s on-site inbox — recording the analytics. Same five operations as every resource, plus a{' '}
          <strong className="text-slate-900 dark:text-white">Send now</strong>.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Pill tone="slate">Base URL: https://gamru-backend-2.onrender.com/api</Pill>
          <Pill tone="slate">Auth: operator JWT</Pill>
        </div>
      </div>

      {/* create body */}
      <section className="mt-8">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-300">
          <Megaphone size={20} />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Anatomy of a campaign</h2>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          The channel decides the delivery adapter (on-site is real; email / SMS / web-push go through stub
          adapters that log). The template is the rendered body; the segment is who receives it; the trigger is
          what starts it.
        </p>
        <div className="mt-4">
          <CodeBlock label="campaign — create body" code={CAMPAIGN_BODY} />
        </div>
      </section>

      {/* CRUD */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">The five operations</h2>
        <div className="mt-4 space-y-3">
          {crud.map((c) => {
            const Icon = c.icon
            const ep = endpointById(c.ep)
            return (
              <div
                key={c.verb + c.title}
                className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-300">
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                        {c.verb}
                      </span>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{c.title}</h4>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{c.body}</p>
                    {ep && (
                      <Link
                        to={`/admin/endpoints/${ep.id}`}
                        className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs transition hover:border-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-rose-500/40"
                      >
                        <MethodBadge method={ep.method} className="scale-90" />
                        <span className="font-mono text-slate-600 dark:text-slate-300">{ep.path}</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Send now + triggers */}
      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-300">
          <Send size={20} />
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Deliver it</h2>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          A campaign delivers one of two ways. Hit <strong>Send now</strong> to resolve the segment and deliver
          immediately, or attach an <strong>event trigger</strong> so the games platform’s forwarded events fire
          it automatically.
        </p>
        <div className="mt-3">
          <EndpointLink id="gamru-campaigns-send" />
        </div>
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2 font-semibold">Player event</th>
                <th className="px-3 py-2 font-semibold">Trigger label to configure</th>
                <th className="px-3 py-2 font-semibold">When it fires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {TRIGGERS.map((t) => (
                <tr key={t.event} className="align-top">
                  <td className="px-3 py-2 font-mono text-[13px] text-rose-700 dark:text-rose-300">{t.event}</td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-600 dark:text-slate-300">{t.label}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{t.when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          The games platform forwards these to <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">POST /api/integration/events</code>{' '}
          (Registration, Deposit) and <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">POST /api/activity</code> (Login).
        </p>
      </section>

      {/* supporting resources */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">What a campaign references</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {SUPPORTING.map((s) => {
            const Icon = s.icon
            const ep = s.ep ? endpointById(s.ep) : null
            const to = ep ? `/admin/endpoints/${ep.id}` : s.to
            return (
              <Link
                key={s.label}
                to={to}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-rose-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-rose-500/40"
              >
                <span className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <Icon size={16} className="text-rose-600 dark:text-rose-300" /> {s.label}
                </span>
                <span className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{s.body}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* footer pointer */}
      <Link
        to="/admin/endpoints"
        className="group mt-12 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-rose-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-rose-500/40"
      >
        <span className="min-w-0">
          <span className="block text-xs uppercase tracking-wider text-slate-400">Full reference</span>
          <span className="font-medium text-slate-800 dark:text-slate-100">
            Every campaign / segment / template endpoint, with request/response in 6 languages
          </span>
        </span>
        <ArrowRight size={16} className="ml-auto shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-rose-500" />
      </Link>
    </div>
  )
}
