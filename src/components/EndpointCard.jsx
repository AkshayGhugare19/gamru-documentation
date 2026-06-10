import { MethodBadge, AuthBadge, CodeBlock, FieldTable } from './primitives'

// Two-column endpoint block: prose on the left, request/response panel on the
// right — the Gamanza "Docs + spec side-by-side" layout.
export default function EndpointCard({ ep }) {
  return (
    <section id={ep.id} className="scroll-mt-24 border-t border-slate-200 py-10 first:border-t-0 dark:border-slate-800">
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
        </div>

        {/* right: examples */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {ep.body && ep.body.fields && (
            <CodeBlock
              label="Request example"
              code={requestExample(ep)}
            />
          )}
          {ep.response && (
            <CodeBlock label={`Response · ${ep.response.status}`} code={ep.response.example} />
          )}
        </div>
      </div>
    </section>
  )
}

function requestExample(ep) {
  // Build a friendly cURL-ish example from the documented fields.
  const base = ep.platform === 'gamru' ? 'https://engine.gamru.io' : 'https://api.yourcasino.com'
  const authHeader =
    ep.auth === 'client'
      ? "  -H 'x-client-auth-key: ck_live_...' \\\n"
      : ep.auth === 'none'
      ? ''
      : "  -H 'Authorization: Bearer <token>' \\\n"
  const serviceHeader = ep.headers?.some((h) => h.name === 'x-service-key')
    ? "  -H 'x-service-key: <shared-secret>' \\\n"
    : ''
  const bodyObj = {}
  for (const f of ep.body.fields) {
    const key = f.name.split(' ')[0].split('/')[0]
    bodyObj[key] = sample(f.type)
  }
  const bodyStr = JSON.stringify(bodyObj, null, 2)
  return (
    `curl -X ${ep.method} ${base}${ep.path} \\\n` +
    authHeader +
    serviceHeader +
    "  -H 'Content-Type: application/json' \\\n" +
    `  -d '${bodyStr}'`
  )
}

function sample(type) {
  const t = (type || '').toLowerCase()
  if (t.includes('number')) return 0
  if (t.includes('bool')) return true
  if (t.includes('[]') || t.includes('array')) return []
  if (t.includes('object') || t.includes('{')) return {}
  if (t.includes('enum') || t.includes('|')) {
    const m = (type.match(/'([^']+)'/) || [])[1]
    return m || 'string'
  }
  return 'string'
}
