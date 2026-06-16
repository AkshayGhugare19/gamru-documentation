import { useState } from 'react'
import { MethodBadge, AuthBadge, CodeBlock, FieldTable } from './primitives'
import EventsReference from './EventsReference'
import { LANGUAGES, buildRequest } from '../lib/snippets'

// Two-column endpoint block: prose on the left, request/response panel on the
// right — the Gamanza "Docs + spec side-by-side" layout.
export default function EndpointCard({ ep }) {
  return (
    <section
      id={ep.id}
      className="scroll-mt-24 border-t border-slate-200 py-10 first:border-t-0 dark:border-slate-800"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        {/* left: description */}
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{ep.title}</h3>
            <AuthBadge auth={ep.auth} />
          </div>
          <div className="mb-4 flex items-center gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
            <MethodBadge method={ep.method} />
            <code className="whitespace-nowrap font-mono text-sm text-slate-700 dark:text-slate-200">{ep.path}</code>
          </div>
          <p className="leading-7 text-slate-600 dark:text-slate-300">{ep.summary}</p>

          {ep.headers && (
            <FieldTable
              title="Headers"
              fields={ep.headers.map((h) => ({ name: h.name, type: 'header', desc: h.desc }))}
            />
          )}
          {ep.params && <FieldTable title="Path params" fields={ep.params.fields} />}
          {ep.query && <FieldTable title="Query params" fields={ep.query.fields} />}
          {ep.body && <FieldTable title="Request body" fields={ep.body.fields} />}
          {ep.errors && ep.errors.length > 0 && <ErrorTable errors={ep.errors} />}
        </div>

        {/* right: multi-language request example + response */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <RequestPanel ep={ep} />
          {ep.response && (
            <CodeBlock label={`Response · ${ep.response.status}`} code={ep.response.example} />
          )}
        </div>
      </div>

      {/* Special: the events firehose gets a full event-type catalog. */}
      {ep.id === 'gamru-integration-events' && <EventsReference />}
    </section>
  )
}

// Error / status-code table — { code, when } rows, rendered when an endpoint
// documents its failure modes.
function ErrorTable({ errors }) {
  return (
    <div className="mt-4">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Errors</h4>
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {errors.map((e) => (
              <tr key={e.code} className="align-top">
                <td className="w-2/5 px-3 py-2 font-mono text-[13px] text-rose-600 dark:text-rose-300">{e.code}</td>
                <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{e.when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Language-tabbed request example — cURL, JavaScript, Node.js, Python, Kotlin, C.
function RequestPanel({ ep }) {
  const req = buildRequest(ep)
  const [active, setActive] = useState('curl')
  const lang = LANGUAGES.find((l) => l.key === active) || LANGUAGES[0]

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
        {LANGUAGES.map((l) => (
          <button
            key={l.key}
            type="button"
            onClick={() => setActive(l.key)}
            className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition ${
              active === l.key
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <CodeBlock label={`Request · ${lang.label}`} code={lang.format(req)} />
    </div>
  )
}
