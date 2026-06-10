import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Server } from 'lucide-react'
import { groupsFor, ENDPOINTS, AUTH } from '../data/endpoints'
import EndpointCard from '../components/EndpointCard'
import { MethodBadge, AuthBadge } from '../components/primitives'

const META = {
  gamru: {
    title: 'Gamru engine API',
    sub: 'gamru-backend',
    base: 'https://engine.gamru.io',
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

export default function ApiPage({ platform }) {
  const meta = META[platform]
  const groups = groupsFor(platform)
  const { hash } = useLocation()
  const [activeGroup, setActiveGroup] = useState(groups[0]?.group)

  // Support deep links like #/api/gamru#gamru-integration-events
  useEffect(() => {
    const id = hash.includes('#') ? hash.split('#').pop() : ''
    if (id) {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        // highlight which group it belongs to
        for (const g of groups) {
          if (g.items.some((it) => it.id === id)) setActiveGroup(g.group)
        }
      }
    }
  }, [hash, platform]) // eslint-disable-line

  const endpointCount = ENDPOINTS.filter((e) => e.platform === platform).length
  const usedAuth = [...new Set(ENDPOINTS.filter((e) => e.platform === platform).map((e) => e.auth))]

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
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{meta.title}</h1>
            <p className="mt-2 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">{meta.blurb}</p>
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

      {groups.map((g) => (
        <div key={g.group} id={slug(g.group)} className="scroll-mt-24">
          <div className="sticky top-16 z-10 -mx-2 mb-2 flex items-center gap-3 bg-slate-50/90 px-2 py-3 backdrop-blur dark:bg-slate-950/90">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{g.group}</h2>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {g.items.length}
            </span>
          </div>
          {/* quick index of endpoints in this group */}
          <div className="mb-2 grid gap-1.5 sm:grid-cols-2">
            {g.items.map((ep) => (
              <button
                key={ep.id}
                type="button"
                onClick={() => scrollToId(ep.id)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <MethodBadge method={ep.method} />
                <span className="truncate font-mono text-xs text-slate-600 dark:text-slate-300">{ep.path}</span>
              </button>
            ))}
          </div>
          <div>
            {g.items.map((ep) => (
              <EndpointCard key={ep.id} ep={ep} />
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
