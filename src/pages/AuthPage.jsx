import { CodeBlock, AuthBadge } from '../components/primitives'

export default function AuthPage() {
  return (
    <div className="doc-content">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Authentication &amp; security
      </h1>
      <p>
        Gamru uses different credentials for different callers. Pick the right one for the job — most integration
        traffic uses the <strong>client key</strong>.
      </p>

      <h2>The four mechanisms</h2>
      <div className="not-prose my-5 space-y-4">
        <AuthRow
          auth="jwt"
          header="Authorization: Bearer <token>"
          who="Back-office operators in the gamru console."
          how="Obtained from POST /api/auth/login. Carries { id, email, role }."
        />
        <AuthRow
          auth="admin"
          header="Authorization: Bearer <token>"
          who="Operators with the ADMIN role."
          how="Same JWT, but the endpoint additionally enforces role('ADMIN') — user/client management, settings, key rotation."
        />
        <AuthRow
          auth="client"
          header="x-client-auth-key: ck_live_..."
          who="Service-to-service: your games platform calling gamru."
          how="Per-client key minted when the client is registered. Tenant-isolated and rotatable. This is GAMRU_CLIENT_AUTH_KEY on the platform."
        />
        <AuthRow
          auth="flex"
          header="either of the above"
          who="Endpoints used by both the console and service backends, e.g. GET /api/players/:id."
          how="The server accepts a client key first, then falls back to a Bearer JWT."
        />
      </div>

      <h2>The event endpoint is double-locked</h2>
      <p>
        <code>POST /api/integration/events</code> requires <strong>both</strong> a client key and a shared service
        secret. The service secret is infrastructure defence-in-depth so a leaked client key can’t be replayed
        from outside your network.
      </p>
      <div className="not-prose my-5">
        <CodeBlock
          label="Event call — both headers required"
          code={`curl -X POST https://gamru-backend-2.onrender.com/api/integration/events \\
  -H 'x-client-auth-key: ck_live_9f2c...' \\
  -H 'x-service-key: <SERVICE_SHARED_KEY>' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "event_id": "WAGER:42:9c1f",
    "event_type": "WAGER",
    "external_id": "42",
    "amount": 5.00,
    "meta": { "game_id": "g-100", "game_category": "slots", "bet": 5.00 }
  }'`}
        />
      </div>

      <h2>Getting your keys</h2>
      <ol>
        <li>An operator registers your client: <code>POST /api/clients/add</code> (ADMIN). The response includes <code>auth_key</code>.</li>
        <li>Put it in the platform env as <code>GAMRU_CLIENT_AUTH_KEY</code>, plus the shared <code>SERVICE_SHARED_KEY</code>.</li>
        <li>On boot the platform calls <code>GET /api/clients/me</code> to confirm the key is valid and the client is ENABLED.</li>
        <li>Rotate any time with <code>POST /api/clients/rotate-auth-key/:id</code> — update the env immediately after.</li>
      </ol>

      <h2>Error codes</h2>
      <ul>
        <li><code>401</code> — missing/invalid credential.</li>
        <li><code>403</code> — valid key but the client is DISABLED (or role insufficient).</li>
        <li><code>409</code> — conflict (e.g. duplicate client name).</li>
      </ul>
    </div>
  )
}

function AuthRow({ auth, header, who, how }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <AuthBadge auth={auth} />
        <code className="font-mono text-xs text-slate-500 dark:text-slate-400">{header}</code>
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-200"><strong>Who:</strong> {who}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300"><strong>How:</strong> {how}</p>
    </div>
  )
}
