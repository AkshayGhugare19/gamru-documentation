import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Server } from 'lucide-react'
import { groupsFor, ENDPOINTS, AUTH } from '../data/endpoints'
import { MethodBadge, AuthBadge } from '../components/primitives'

export const PLATFORM_META = {
  gamru: {
    title: 'Gamru engine API',
    sub: 'gamru-backend',
    base: 'https://gamru-backend-2.onrender.com',
    blurb:
      'The gamification engine and operator API. Operator/console endpoints use a JWT; service-to-service endpoints (called by your games platform) use the client key. Base path is /api.',
  },
  games: {
    title: 'Games platform API',
    sub: 'my-game-platform-backend',
    base: 'https://api.yourcasino.com',
    blurb:
      'The player-facing casino API. Almost everything requires the player JWT. Many endpoints read from or proxy to the gamru engine — those are called out per endpoint and in the flows.',
  },
}

const AUDIENCE_BLURB = {
  user: 'The endpoints YOUR platform calls server-to-server with your client key — register a player, read their progress, claim missions & rewards, spend tokens, submit scores. Base path is /api.',
  admin:
    'The operator console surface — create / update / delete missions, mission bundles, ranks, rules, the reward shop, tournaments, templates, segments, campaigns, clients and settings. Most endpoints need an operator JWT. Base path is /api.',
}

export default function ApiPage({ platform, audience }) {
  const meta = PLATFORM_META[platform]
  const groups = groupsFor(platform, audience)
  const [activeGroup, setActiveGroup] = useState(groups[0]?.group)

  const inScope = (e) => e.platform === platform && (!audience || e.audience === audience || e.audience === 'both')
  const endpointCount = ENDPOINTS.filter(inScope).length
  const usedAuth = [...new Set(ENDPOINTS.filter(inScope).map((e) => e.auth))]
  const blurb = (audience && AUDIENCE_BLURB[audience]) || meta.blurb
  const title = audience === 'admin' ? 'Gamru admin API' : audience === 'user' ? 'Gamru user API' : meta.title
  // Endpoint detail lives under the active panel so navigation never flips sides.
  const detailBase = audience === 'admin' ? '/admin/endpoints' : '/user/endpoints'

  return (
    <div>
      {/* hero header */}
      <div className="not-prose overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-brand-500/10 dark:to-slate-900/40 sm:p-8">
        <div className="mb-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          API reference <span>/</span> <code className="font-mono">{meta.sub}</code>
        </div>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white sm:flex">
            <Server size={20} />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h1>
            <p className="mt-2 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">{blurb}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900">
            <span className="text-xs uppercase tracking-wider text-slate-400">Base URL</span>
            <code className="font-mono text-slate-700 dark:text-slate-200">{meta.base}</code>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <strong className="font-semibold text-slate-900 dark:text-white">{endpointCount}</strong> endpoints
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <strong className="font-semibold text-slate-900 dark:text-white">{groups.length}</strong> groups
          </span>
        </div>

        {/* auth legend — tells the reader what each badge means up front */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="text-xs uppercase tracking-wider text-slate-400">Auth</span>
          {usedAuth.map((a) => (
            <span key={a} className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <AuthBadge auth={a} />
              {AUTH[a]?.hint || ''}
            </span>
          ))}
        </div>
      </div>

      {/* on-this-page group jumper */}
      <div className="my-6 flex flex-wrap gap-2">
        {groups.map((g) => (
          <button
            key={g.group}
            type="button"
            onClick={() => {
              setActiveGroup(g.group)
              scrollToId(slug(g.group))
            }}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              activeGroup === g.group
                ? 'border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-500/40 dark:bg-brand-500/10 dark:text-brand-300'
                : 'border-slate-200 text-slate-600 hover:border-brand-300 dark:border-slate-800 dark:text-slate-400'
            }`}
          >
            {g.group}
          </button>
        ))}
      </div>

      {/* each group lists its endpoints as links to their own detail page */}
      {groups.map((g) => (
        <div key={g.group} id={slug(g.group)} className="mb-10 scroll-mt-24">
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{g.group}</h2>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {g.items.length}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {g.items.map((ep) => (
              <Link
                key={ep.id}
                to={`${detailBase}/${ep.id}`}
                className="group flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/40"
              >
                <div className="flex items-center gap-2">
                  <MethodBadge method={ep.method} />
                  <code className="truncate font-mono text-xs text-slate-600 dark:text-slate-300">{ep.path}</code>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900 transition group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
                    {ep.title}
                  </h3>
                  <AuthBadge auth={ep.auth} />
                </div>
                <p className="line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{ep.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function slug(s) {
  return 'grp-' + s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function scrollToId(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
