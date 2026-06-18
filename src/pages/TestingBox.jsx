import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Send,
  Plus,
  Trash2,
  KeyRound,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { ENDPOINTS, AUTH, groupsFor, matchesAudience } from '../data/endpoints'
import { bodyExample, sample } from '../lib/snippets'
import { MethodBadge, AuthBadge } from '../components/primitives'

// Real gamru engine base — same host the code snippets point at.
const DEFAULT_BASE = 'https://gamru-backend-2.onrender.com'

// ---------------------------------------------------------------------------
// Per-audience persistence. The whole point of two boxes: the USER side talks
// to the engine with a client key (S2S) while the ADMIN side uses an operator
// JWT — so each box keeps its own Base URL + credentials in localStorage.
// ---------------------------------------------------------------------------
const credKey = (audience) => `gamru-testbox-creds-${audience}`

function loadCreds(audience) {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(localStorage.getItem(credKey(audience)) || 'null')
  } catch {
    return null
  }
}

function defaultCreds() {
  return { baseUrl: DEFAULT_BASE, token: '', clientKey: '', serviceKey: '' }
}

let rowSeq = 0
const kv = (key = '', value = '', enabled = true) => ({ id: ++rowSeq, key, value, enabled })

const mask = (v) => (!v ? '' : v.length <= 8 ? '••••' : `${v.slice(0, 4)}…${v.slice(-4)}`)

const hasBody = (ep) => !!(ep?.body && ep.body.fields && ep.body.fields.length)

// Which credential a given endpoint's auth needs. Mirrors snippets.buildRequest.
function authHeaderFor(ep, creds) {
  if (!ep || !ep.auth || ep.auth === 'none') return null
  if (ep.auth === 'client') {
    return { name: 'x-client-auth-key', value: creds.clientKey, need: 'client key' }
  }
  if (ep.auth === 'flex') {
    // operator JWT *or* client key — use whichever is filled, preferring the token.
    if (creds.token) return { name: 'Authorization', value: `Bearer ${creds.token}`, need: 'Bearer token or client key' }
    if (creds.clientKey) return { name: 'x-client-auth-key', value: creds.clientKey, need: 'Bearer token or client key' }
    return { name: 'Authorization', value: '', need: 'Bearer token or client key' }
  }
  // jwt | admin | player → bearer token
  return {
    name: 'Authorization',
    value: creds.token ? `Bearer ${creds.token}` : '',
    need: 'Bearer token',
  }
}

// Which credential *inputs* to show for the selected endpoint. Base URL is
// always shown; the secret fields only appear when the endpoint needs them.
function credNeeds(ep) {
  const a = ep?.auth
  return {
    token: a === 'jwt' || a === 'admin' || a === 'player' || a === 'flex',
    clientKey: a === 'client' || a === 'flex',
    serviceKey: !!ep?.headers?.some((h) => h.name === 'x-service-key'),
  }
}

// ---------------------------------------------------------------------------
// Small editable key/value table — the Postman params/headers grid.
// ---------------------------------------------------------------------------
function KeyValueEditor({ rows, setRows, lockedKeys = false, placeholderKey = 'key', placeholderVal = 'value' }) {
  const update = (id, patch) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const remove = (id) => setRows((rs) => rs.filter((r) => r.id !== id))
  const add = () => setRows((rs) => [...rs, kv()])

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.length === 0 && (
            <tr>
              <td className="px-3 py-3 text-xs text-slate-400">No entries.</td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.id} className="align-middle">
              <td className="w-8 pl-3">
                <input
                  type="checkbox"
                  checked={r.enabled}
                  onChange={(e) => update(r.id, { enabled: e.target.checked })}
                  className="accent-brand-600"
                />
              </td>
              <td className="w-1/3 py-1">
                <input
                  value={r.key}
                  readOnly={lockedKeys}
                  onChange={(e) => update(r.id, { key: e.target.value })}
                  placeholder={placeholderKey}
                  className={`w-full bg-transparent px-2 py-1 font-mono text-[13px] outline-none placeholder:text-slate-400 ${
                    lockedKeys ? 'text-brand-700 dark:text-brand-300' : 'text-slate-800 dark:text-slate-100'
                  }`}
                />
              </td>
              <td className="py-1">
                <input
                  value={r.value}
                  onChange={(e) => update(r.id, { value: e.target.value })}
                  placeholder={placeholderVal}
                  className="w-full bg-transparent px-2 py-1 font-mono text-[13px] text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
                />
              </td>
              <td className="w-9 pr-2 text-right">
                {!lockedKeys && (
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    className="rounded p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                    aria-label="Remove row"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!lockedKeys && (
        <button
          type="button"
          onClick={add}
          className="flex w-full items-center gap-1.5 border-t border-slate-100 px-3 py-2 text-xs font-medium text-brand-600 transition hover:bg-brand-50 dark:border-slate-800 dark:text-brand-300 dark:hover:bg-brand-500/10"
        >
          <Plus size={13} /> Add row
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Credentials card — persisted per audience.
// ---------------------------------------------------------------------------
function CredField({ label, hint, value, onChange, secret, placeholder, mono = true }) {
  const [show, setShow] = useState(false)
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
        {label}
        {hint && <span className="font-normal text-slate-400">— {hint}</span>}
      </span>
      <div className="flex items-center rounded-lg border border-slate-300 bg-white focus-within:border-brand-400 dark:border-slate-700 dark:bg-slate-900">
        <input
          type={secret && !show ? 'password' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400 ${
            mono ? 'font-mono' : ''
          } text-slate-800 dark:text-slate-100`}
        />
        {secret && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="px-2 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200"
            aria-label={show ? 'Hide' : 'Show'}
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </label>
  )
}

// ---------------------------------------------------------------------------
// Main testing box.
// ---------------------------------------------------------------------------
export default function TestingBox({ audience }) {
  const groups = useMemo(() => groupsFor('gamru', audience), [audience])
  const endpoints = useMemo(() => ENDPOINTS.filter((e) => e.platform === 'gamru' && matchesAudience(e, audience)), [audience])

  // ---- credentials (persisted) ----
  const [creds, setCreds] = useState(() => ({ ...defaultCreds(), ...(loadCreds(audience) || {}) }))
  const [credsOpen, setCredsOpen] = useState(true)
  useEffect(() => {
    // reload when switching panel
    setCreds({ ...defaultCreds(), ...(loadCreds(audience) || {}) })
  }, [audience])
  useEffect(() => {
    try {
      localStorage.setItem(credKey(audience), JSON.stringify(creds))
    } catch {
      /* storage unavailable */
    }
  }, [creds, audience])
  const setCred = (patch) => setCreds((c) => ({ ...c, ...patch }))

  // ---- selected endpoint + request builder state ----
  const [epId, setEpId] = useState(() => endpoints[0]?.id || '')
  const ep = endpoints.find((e) => e.id === epId) || endpoints[0]

  const [tab, setTab] = useState('body')
  const [pathRows, setPathRows] = useState([])
  const [queryRows, setQueryRows] = useState([])
  const [headerRows, setHeaderRows] = useState([])
  const [bodyText, setBodyText] = useState('')

  // Reset the builder whenever the chosen endpoint changes.
  useEffect(() => {
    if (!ep) return
    setPathRows((ep.params?.fields || []).map((f) => kv(f.name, String(sample(f.name, f.type)))))
    setQueryRows((ep.query?.fields || []).map((f) => kv(f.name, String(sample(f.name, f.type)), false)))
    setHeaderRows([]) // auth + content-type are applied automatically; this is for extras
    setBodyText(hasBody(ep) ? JSON.stringify(bodyExample(ep), null, 2) : '')
    setTab(hasBody(ep) ? 'body' : ep.query ? 'params' : 'headers')
    setResp(null)
    setSendErr('')
  }, [epId]) // eslint-disable-line react-hooks/exhaustive-deps

  // If the panel (audience) changes, jump to its first endpoint.
  useEffect(() => {
    if (!endpoints.find((e) => e.id === epId)) setEpId(endpoints[0]?.id || '')
  }, [audience]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---- assemble the live request ----
  const authHeader = authHeaderFor(ep, creds)
  const needs = useMemo(() => credNeeds(ep), [ep])

  const resolvedPath = useMemo(() => {
    let p = ep?.path || ''
    for (const r of pathRows) {
      if (!r.key) continue
      p = p.replace(`:${r.key}`, encodeURIComponent(r.value || `:${r.key}`))
    }
    return p
  }, [ep, pathRows])

  const queryString = useMemo(() => {
    const parts = queryRows
      .filter((r) => r.enabled && r.key)
      .map((r) => `${encodeURIComponent(r.key)}=${encodeURIComponent(r.value)}`)
    return parts.length ? `?${parts.join('&')}` : ''
  }, [queryRows])

  const fullUrl = `${(creds.baseUrl || '').replace(/\/$/, '')}${resolvedPath}${queryString}`

  // Final header set actually sent: auto auth + content-type + enabled extras.
  const effectiveHeaders = useMemo(() => {
    const h = {}
    if (authHeader && authHeader.value) h[authHeader.name] = authHeader.value
    if (needs.serviceKey && creds.serviceKey) h['x-service-key'] = creds.serviceKey
    if (hasBody(ep) && bodyText.trim()) h['Content-Type'] = 'application/json'
    for (const r of headerRows) if (r.enabled && r.key) h[r.key] = r.value
    return h
  }, [authHeader, needs, creds.serviceKey, ep, bodyText, headerRows])

  // ---- send ----
  const [resp, setResp] = useState(null)
  const [sending, setSending] = useState(false)
  const [sendErr, setSendErr] = useState('')
  const [respTab, setRespTab] = useState('body')
  const abortRef = useRef(null)

  const bodyInvalid = (() => {
    if (!hasBody(ep) || !bodyText.trim()) return false
    try {
      JSON.parse(bodyText)
      return false
    } catch {
      return true
    }
  })()

  const send = async () => {
    if (!ep || sending || bodyInvalid) return
    setSending(true)
    setSendErr('')
    setResp(null)
    const controller = new AbortController()
    abortRef.current = controller
    const started = performance.now()
    try {
      const init = { method: ep.method, headers: effectiveHeaders, signal: controller.signal }
      if (hasBody(ep) && bodyText.trim() && ep.method !== 'GET' && ep.method !== 'HEAD') {
        init.body = bodyText
      }
      const res = await fetch(fullUrl, init)
      const elapsed = Math.round(performance.now() - started)
      const text = await res.text()
      let pretty = text
      let json = null
      try {
        json = JSON.parse(text)
        pretty = JSON.stringify(json, null, 2)
      } catch {
        /* not json — show raw */
      }
      const resHeaders = []
      res.headers.forEach((v, k) => resHeaders.push([k, v]))
      setResp({
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        ms: elapsed,
        size: new Blob([text]).size,
        headers: resHeaders,
        body: pretty,
        isJson: json !== null,
      })
      setRespTab('body')
    } catch (e) {
      const elapsed = Math.round(performance.now() - started)
      if (e.name === 'AbortError') setSendErr('Request cancelled.')
      else
        setSendErr(
          `${e.message || 'Request failed'} — likely a network/CORS error. The engine must allow this origin, or run it from a tool without CORS (curl/Postman). (${elapsed}ms)`,
        )
    } finally {
      setSending(false)
      abortRef.current = null
    }
  }

  if (!ep) {
    return <p className="text-slate-500">No endpoints available for this panel.</p>
  }

  const statusColor = !resp
    ? ''
    : resp.ok
    ? 'text-emerald-600 dark:text-emerald-400'
    : resp.status >= 500
    ? 'text-rose-600 dark:text-rose-400'
    : 'text-amber-600 dark:text-amber-400'

  const credMissing = authHeader && !authHeader.value

  return (
    <div>
      {/* header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Testing box · {audience === 'admin' ? 'Admin' : 'User'}
          </h1>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              audience === 'admin'
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                : 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
            }`}
          >
            {audience === 'admin' ? 'Operator JWT surface' : 'Client-key surface'}
          </span>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Fire real requests at the Gamru engine — like Postman, but scoped to the{' '}
          <strong>{audience}</strong> API. Set your keys once below; the right auth header is attached
          automatically per endpoint.
        </p>
      </div>

      {/* credentials */}
      <div className="mb-5 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setCredsOpen((v) => !v)}
          className="flex w-full items-center gap-2 bg-slate-50 px-4 py-2.5 text-left dark:bg-slate-900/50"
        >
          {credsOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
          <KeyRound size={15} className={audience === 'admin' ? 'text-rose-500' : 'text-brand-500'} />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Environment & credentials
          </span>
          <span className="ml-2 text-xs text-slate-400">saved for the {audience} box</span>
        </button>
        {credsOpen && (
          <div className="grid gap-4 border-t border-slate-200 p-4 dark:border-slate-800 sm:grid-cols-2">
            <CredField
              label="Base URL"
              value={creds.baseUrl}
              onChange={(v) => setCred({ baseUrl: v })}
              placeholder={DEFAULT_BASE}
            />
            {needs.token && (
              <CredField
                label="Bearer token"
                hint={ep.auth === 'flex' ? 'operator JWT (or use client key)' : audience === 'admin' ? 'operator JWT' : 'player / JWT'}
                secret
                value={creds.token}
                onChange={(v) => setCred({ token: v })}
                placeholder="eyJhbGciOiJIUzI1NiI…"
              />
            )}
            {needs.clientKey && (
              <CredField
                label="x-client-auth-key"
                hint="client key (S2S)"
                secret
                value={creds.clientKey}
                onChange={(v) => setCred({ clientKey: v })}
                placeholder="ck_live_…"
              />
            )}
            {needs.serviceKey && (
              <CredField
                label="x-service-key"
                hint="shared secret (events)"
                secret
                value={creds.serviceKey}
                onChange={(v) => setCred({ serviceKey: v })}
                placeholder="shared secret"
              />
            )}
            {ep.auth === 'none' && (
              <p className="self-center text-xs text-slate-400">
                This endpoint is public — no credentials required.
              </p>
            )}
          </div>
        )}
      </div>

      {/* endpoint picker */}
      <div className="mb-4">
        <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Endpoint</label>
        <div className="flex items-center gap-2">
          <MethodBadge method={ep.method} />
          <select
            value={epId}
            onChange={(e) => setEpId(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            {groups.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.method} · {it.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <AuthBadge auth={ep.auth} />
        </div>
      </div>

      {/* request line + send */}
      <div className="mb-3 flex items-stretch gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
          <MethodBadge method={ep.method} />
          <code className="whitespace-nowrap font-mono text-[13px] text-slate-700 dark:text-slate-200">{fullUrl}</code>
        </div>
        <button
          type="button"
          onClick={send}
          disabled={sending || bodyInvalid}
          className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
            audience === 'admin' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-600 hover:bg-brand-700'
          }`}
        >
          {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          {sending ? 'Sending…' : 'Send'}
        </button>
      </div>

      {/* auth status line */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        {ep.auth === 'none' ? (
          <span className="text-slate-400">Public endpoint — no auth header attached.</span>
        ) : credMissing ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle size={13} /> Set your {authHeader.need} above — nothing will be sent for{' '}
            <code className="font-mono">{authHeader.name}</code>.
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <KeyRound size={12} /> {authHeader.name}: {authHeader.name === 'Authorization' ? `Bearer ${mask(creds.token)}` : mask(creds.clientKey)}
          </span>
        )}
      </div>

      {/* request tabs */}
      <div className="mb-2 flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {[
          ['params', `Params${queryRows.length || pathRows.length ? ` (${pathRows.length + queryRows.filter((r) => r.enabled).length})` : ''}`],
          ['headers', `Headers${headerRows.filter((r) => r.enabled && r.key).length ? ` (${headerRows.filter((r) => r.enabled && r.key).length})` : ''}`],
          ['body', 'Body'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
              tab === key
                ? audience === 'admin'
                  ? 'border-rose-500 text-rose-700 dark:text-rose-300'
                  : 'border-brand-500 text-brand-700 dark:text-brand-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-6">
        {tab === 'params' && (
          <div className="space-y-4">
            {pathRows.length > 0 && (
              <div>
                <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Path params</h4>
                <KeyValueEditor rows={pathRows} setRows={setPathRows} lockedKeys />
              </div>
            )}
            <div>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Query params</h4>
              <KeyValueEditor rows={queryRows} setRows={setQueryRows} placeholderKey="param" />
            </div>
          </div>
        )}

        {tab === 'headers' && (
          <div className="space-y-3">
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
              Auto-attached:{' '}
              {Object.keys(effectiveHeaders).filter((k) => !headerRows.some((r) => r.enabled && r.key === k)).length === 0
                ? 'none'
                : Object.entries(effectiveHeaders)
                    .filter(([k]) => !headerRows.some((r) => r.enabled && r.key === k))
                    .map(([k]) => k)
                    .join(', ')}{' '}
              — add any extra headers below.
            </div>
            <KeyValueEditor rows={headerRows} setRows={setHeaderRows} placeholderKey="header" />
          </div>
        )}

        {tab === 'body' && (
          <div>
            {hasBody(ep) ? (
              <>
                <textarea
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  spellCheck={false}
                  rows={12}
                  className={`w-full rounded-lg border bg-slate-900 p-3 font-mono text-[13px] text-slate-100 outline-none ${
                    bodyInvalid ? 'border-rose-500' : 'border-slate-700 focus:border-brand-400'
                  }`}
                />
                {bodyInvalid && (
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    <AlertTriangle size={13} /> Invalid JSON — fix it before sending.
                  </p>
                )}
              </>
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-400 dark:border-slate-700">
                This {ep.method} endpoint takes no request body.
              </p>
            )}
          </div>
        )}
      </div>

      {/* response */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-2.5 dark:border-slate-800">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Response</span>
          {resp && (
            <>
              <span className={`font-mono text-sm font-bold ${statusColor}`}>
                {resp.status} {resp.statusText}
              </span>
              <span className="text-xs text-slate-400">{resp.ms} ms</span>
              <span className="text-xs text-slate-400">{resp.size} B</span>
            </>
          )}
        </div>

        <div className="p-4">
          {sendErr && (
            <div className="mb-3 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <span>{sendErr}</span>
            </div>
          )}

          {!resp && !sendErr && (
            <p className="py-6 text-center text-sm text-slate-400">
              Hit <strong>Send</strong> to see the status, headers and body here.
            </p>
          )}

          {resp && (
            <>
              <div className="mb-2 flex gap-1 border-b border-slate-200 dark:border-slate-800">
                {['body', `headers (${resp.headers.length})`].map((t) => {
                  const key = t.startsWith('headers') ? 'headers' : 'body'
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setRespTab(key)}
                      className={`-mb-px border-b-2 px-3 py-1.5 text-sm font-medium capitalize transition ${
                        respTab === key
                          ? 'border-brand-500 text-brand-700 dark:text-brand-300'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
              {respTab === 'body' ? (
                <pre className="max-h-[28rem] overflow-auto rounded-lg bg-slate-900 p-3 text-[13px] leading-relaxed">
                  <code className="font-mono text-slate-200">{resp.body || '(empty body)'}</code>
                </pre>
              ) : (
                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {resp.headers.map(([k, v]) => (
                        <tr key={k}>
                          <td className="w-1/3 px-3 py-1.5 font-mono text-[13px] text-brand-700 dark:text-brand-300">{k}</td>
                          <td className="px-3 py-1.5 font-mono text-[13px] text-slate-600 dark:text-slate-300">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
