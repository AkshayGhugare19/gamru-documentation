// ---------------------------------------------------------------------------
// Multi-language request snippet generator.
//
// buildRequest(ep) reduces an endpoint to a transport-agnostic shape
//   { method, url, headers: [[k,v]...], body: object|null }
// and each LANGUAGES[].format(req) renders that into idiomatic client code
// (cURL, JavaScript fetch, Node axios, Python requests, Kotlin OkHttp, C libcurl).
// ---------------------------------------------------------------------------

// ---- realistic, name-aware sample values --------------------------------
const NAMED = {
  email: 'jane@lucky-casino.com',
  first_name: 'Jane',
  last_name: 'Doe',
  password: 'S3curePass!',
  new_password: 'S3curePass!',
  mobile: '15551234567',
  external_id: 'P-1001',
  player_id: 'P-1001',
  username: 'jane',
  origin: 'lucky-casino',
  event_id: 'WAGER:P-1001:r-88421',
  event_type: 'WAGER',
  amount: 25,
  points: 1500,
  quantity: 1,
  limit: 10,
  page: 1,
  priority: 1,
  idempotencyKey: 'idem-7f3a91',
  gameId: 'g-100',
  productId: 'xp-booster',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  token: 'rst_8c1d2e3f',
  slug: 'lucky-casino',
  skin_id: 'lc',
  webhook_url: 'https://lucky-casino.com/webhooks/gamru',
  name: 'Lucky Casino',
  subject: 'Welcome to Lucky Casino 🎰',
  reason: 'too_many_emails',
  search: 'jane',
}

const NAMED_OBJECTS = {
  game: { id: 'g-100', name: 'Starburst', category: 'slots', provider: 'NetEnt', turnover: 50 },
  meta: { game_id: 'g-100', game_category: 'slots', bet: 5 },
  device_support: { mobile: true, desktop: true },
  content: { match: 'ALL', rules: [{ field: 'total_deposit', op: 'gte', value: 100 }] },
  items: [{ panel: 'gamification', key: 'xp_boost', value: 2 }],
  tags: ['vip'],
  consents: { marketing: true },
  data: { objectives: [{ type: 'WAGER', target: 10 }], reward: { type: 'XP', value: 50 } },
}

export function sample(name, type) {
  const key = (name || '').trim()
  if (key in NAMED_OBJECTS) return NAMED_OBJECTS[key]
  if (key in NAMED) return NAMED[key]

  const t = (type || '').toLowerCase()
  if (t.includes('number')) return 0
  if (t.includes('bool')) return true
  if (t.includes('uuid')) return '3fa85f64-5717-4562-b3fc-2c963f66afa6'
  if (t.includes('date')) return '2026-06-10'
  if (t.includes('[]') || t.includes('array')) return []
  if (t.includes('object') || t.includes('{')) return {}
  if (t.includes('enum') || t.includes('|')) {
    const m = (type.match(/'([^']+)'/) || [])[1]
    return m || 'string'
  }
  return 'string'
}

// Prefer a hand-authored ep.bodyExample, else synthesise from the fields.
export function bodyExample(ep) {
  if (ep.bodyExample) return ep.bodyExample
  if (!ep.body || !ep.body.fields) return {}
  const obj = {}
  for (const f of ep.body.fields) {
    const k = f.name.split(' ')[0].split('/')[0]
    obj[k] = sample(k, f.type)
  }
  return obj
}

function buildQuery(fields) {
  const parts = fields.slice(0, 2).map((f) => {
    const k = f.name.split(' ')[0].split('/')[0]
    return `${k}=${encodeURIComponent(String(sample(k, f.type)))}`
  })
  return parts.length ? `?${parts.join('&')}` : ''
}

// ---- transport-agnostic request model -----------------------------------
export function buildRequest(ep) {
  const base = ep.platform === 'gamru' ? 'https://gamru-backend-2.onrender.com' : 'https://api.yourcasino.com'

  let path = ep.path
  if (ep.params) {
    for (const p of ep.params.fields) path = path.replace(`:${p.name}`, String(sample(p.name, p.type)))
  }
  const qs = ep.query ? buildQuery(ep.query.fields) : ''
  const url = `${base}${path}${qs}`

  const hasBody = !!(ep.body && ep.body.fields && ep.body.fields.length)
  const headers = []
  if (ep.auth === 'client') headers.push(['x-client-auth-key', 'ck_live_...'])
  else if (ep.auth !== 'none') headers.push(['Authorization', 'Bearer <token>'])
  if (ep.headers?.some((h) => h.name === 'x-service-key')) headers.push(['x-service-key', '<shared-secret>'])
  if (hasBody) headers.push(['Content-Type', 'application/json'])

  return { method: ep.method, url, headers, body: hasBody ? bodyExample(ep) : null }
}

// ---- helpers ------------------------------------------------------------
// Pretty JSON whose 2nd+ lines are indented so it nests under a code prefix.
function jsonBlock(obj, pad) {
  return JSON.stringify(obj, null, 2)
    .split('\n')
    .map((l, i) => (i === 0 ? l : pad + l))
    .join('\n')
}

function toPython(obj, pad) {
  return jsonBlock(obj, pad)
    .replace(/: true\b/g, ': True')
    .replace(/: false\b/g, ': False')
    .replace(/: null\b/g, ': None')
}

// ---- per-language formatters --------------------------------------------
function curl(req) {
  const lines = [`curl -X ${req.method} "${req.url}"`]
  for (const [k, v] of req.headers) lines.push(`  -H "${k}: ${v}"`)
  if (req.body) lines.push(`  -d '${JSON.stringify(req.body, null, 2)}'`)
  return lines.join(' \\\n')
}

function javascript(req) {
  const h = req.headers.map(([k, v]) => `    "${k}": "${v}"`).join(',\n')
  const out = [`const res = await fetch("${req.url}", {`, `  method: "${req.method}",`]
  if (req.headers.length) out.push(`  headers: {\n${h}\n  },`)
  if (req.body) out.push(`  body: JSON.stringify(${jsonBlock(req.body, '  ')}),`)
  out.push('});', '', 'const data = await res.json();', 'console.log(data);')
  return out.join('\n')
}

function node(req) {
  const h = req.headers.map(([k, v]) => `    "${k}": "${v}"`).join(',\n')
  const out = ['const axios = require("axios");', '', 'const response = await axios({', `  method: "${req.method.toLowerCase()}",`, `  url: "${req.url}",`]
  if (req.headers.length) out.push(`  headers: {\n${h}\n  },`)
  if (req.body) out.push(`  data: ${jsonBlock(req.body, '  ')},`)
  out.push('});', '', 'console.log(response.data);')
  return out.join('\n')
}

function python(req) {
  const h = req.headers.map(([k, v]) => `    "${k}": "${v}",`).join('\n')
  const out = ['import requests', '', `url = "${req.url}"`]
  if (req.headers.length) out.push(`headers = {\n${h}\n}`)
  if (req.body) out.push(`payload = ${toPython(req.body, '')}`)

  const args = ['url']
  if (req.headers.length) args.push('headers=headers')
  if (req.body) args.push('json=payload')
  out.push('', `response = requests.request("${req.method}", ${args.join(', ')})`, 'print(response.json())')
  return out.join('\n')
}

function kotlin(req) {
  const out = ['import okhttp3.*', 'import okhttp3.MediaType.Companion.toMediaType']
  if (req.body) out.push('import okhttp3.RequestBody.Companion.toRequestBody')
  out.push('', 'val client = OkHttpClient()', '')
  if (req.body) {
    out.push('val body = """', JSON.stringify(req.body, null, 2), '""".trimIndent().toRequestBody("application/json".toMediaType())', '')
  }
  out.push('val request = Request.Builder()', `    .url("${req.url}")`)
  out.push(req.body ? `    .method("${req.method}", body)` : `    .method("${req.method}", null)`)
  for (const [k, v] of req.headers) {
    if (k === 'Content-Type') continue // carried by the media type above
    out.push(`    .addHeader("${k}", "${v}")`)
  }
  out.push('    .build()', '', 'client.newCall(request).execute().use { response ->', '    println(response.body?.string())', '}')
  return out.join('\n')
}

function c(req) {
  const escaped = req.body ? JSON.stringify(req.body).replace(/\\/g, '\\\\').replace(/"/g, '\\"') : null
  const out = ['#include <stdio.h>', '#include <curl/curl.h>', '', 'int main(void) {', '    CURL *curl = curl_easy_init();', '    if (curl) {']
  if (req.headers.length) {
    out.push('        struct curl_slist *headers = NULL;')
    for (const [k, v] of req.headers) out.push(`        headers = curl_slist_append(headers, "${k}: ${v}");`)
    out.push('')
  }
  out.push(`        curl_easy_setopt(curl, CURLOPT_URL, "${req.url}");`)
  out.push(`        curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, "${req.method}");`)
  if (req.headers.length) out.push('        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);')
  if (escaped) out.push(`        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, "${escaped}");`)
  out.push('', '        curl_easy_perform(curl);')
  if (req.headers.length) out.push('        curl_slist_free_all(headers);')
  out.push('        curl_easy_cleanup(curl);', '    }', '    return 0;', '}')
  return out.join('\n')
}

export const LANGUAGES = [
  { key: 'curl', label: 'cURL', format: curl },
  { key: 'javascript', label: 'JavaScript', format: javascript },
  { key: 'node', label: 'Node.js', format: node },
  { key: 'python', label: 'Python', format: python },
  { key: 'kotlin', label: 'Kotlin', format: kotlin },
  { key: 'c', label: 'C', format: c },
]
