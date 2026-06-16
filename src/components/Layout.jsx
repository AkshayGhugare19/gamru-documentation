import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Boxes, ChevronRight, Github, Menu, Moon, Search, Sun, UserCog, User, X } from 'lucide-react'
import { PANELS, panelFor } from '../data/panels'
import { ENDPOINTS, groupsFor } from '../data/endpoints'
import { MethodBadge } from './primitives'
import LanguageSelect from './LanguageSelect'

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem('gamru-docs-theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark)
    localStorage.setItem('gamru-docs-theme', dark ? 'dark' : 'light')
  }, [dark])
  return [dark, setDark]
}

// Client-side search across the endpoints of the ACTIVE panel only.
function buildSearchIndex(panelKey) {
  return ENDPOINTS.filter((e) => e.audience === panelKey || e.audience === 'both').map((e) => ({
    label: `${e.method} ${e.path}`,
    sub: e.title,
    to: `/${panelKey}/endpoints/${e.id}`,
  }))
}

function SearchBox({ panelKey }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const index = buildSearchIndex(panelKey)
  const results = q.trim()
    ? index.filter((x) => (x.label + ' ' + x.sub).toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    : []
  return (
    <div className="relative w-full max-w-xs">
      <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900">
        <Search size={15} className="text-slate-400" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search endpoints…"
          className="w-full bg-transparent outline-none placeholder:text-slate-400"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-[26rem] max-w-[80vw] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {results.map((r) => (
            <a
              key={r.to + r.label}
              href={'#' + r.to}
              onMouseDown={(e) => {
                e.preventDefault()
                window.location.hash = r.to
                setQ('')
                setOpen(false)
              }}
              className="block border-b border-slate-100 px-4 py-2.5 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              <div className="font-mono text-[13px] text-slate-800 dark:text-slate-100">{r.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{r.sub}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// Expandable API section: collapsible endpoint groups -> per-endpoint links.
function ApiNavSection({ section, platform, audience, onNavigate }) {
  const { pathname } = useLocation()
  const groups = groupsFor(platform, audience)
  // Endpoint detail lives under the active panel, e.g. /admin/endpoints/:id.
  const base = audience === 'admin' ? '/admin/endpoints' : '/user/endpoints'
  const activeId = pathname.startsWith(base + '/') ? pathname.slice(base.length + 1) : ''
  const activeGroup = groups.find((g) => g.items.some((it) => it.id === activeId))?.group

  const [open, setOpen] = useState(() => new Set(activeGroup ? [activeGroup] : []))

  useEffect(() => {
    if (activeGroup) setOpen((prev) => (prev.has(activeGroup) ? prev : new Set(prev).add(activeGroup)))
  }, [activeGroup])

  const toggle = (g) =>
    setOpen((prev) => {
      const next = new Set(prev)
      next.has(g) ? next.delete(g) : next.add(g)
      return next
    })

  return (
    <div>
      <h4 className="mb-2 flex items-center gap-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        <span className="h-1 w-1 rounded-full bg-brand-500" />
        {section}
      </h4>
      <ul className="space-y-0.5">
        {groups.map((g) => {
          const isOpen = open.has(g.group)
          return (
            <li key={g.group}>
              <button
                type="button"
                onClick={() => toggle(g.group)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-slate-100"
              >
                <ChevronRight
                  size={14}
                  className={`shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                />
                <span className="flex-1 truncate font-medium">{g.group}</span>
                <span className="rounded-full bg-slate-100 px-1.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {g.items.length}
                </span>
              </button>
              {isOpen && (
                <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2 dark:border-slate-800">
                  {g.items.map((ep) => {
                    const isActive = activeId === ep.id
                    return (
                      <li key={ep.id}>
                        <Link
                          to={`${base}/${ep.id}`}
                          onClick={onNavigate}
                          className={`flex items-center gap-2 rounded-md px-2 py-1 transition ${
                            isActive
                              ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
                              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                          }`}
                        >
                          <MethodBadge method={ep.method} className="scale-90" />
                          <span className="truncate text-[13px]">{ep.title}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Sidebar({ panel, onNavigate }) {
  return (
    <nav className="space-y-7 pb-16 text-sm">
      {panel.nav.map((group) =>
        group.platform ? (
          <ApiNavSection
            key={group.section}
            section={group.section}
            platform={group.platform}
            audience={group.audience}
            onNavigate={onNavigate}
          />
        ) : (
          <div key={group.section}>
            <h4 className="mb-2 flex items-center gap-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              <span className="h-1 w-1 rounded-full bg-brand-500" />
              {group.section}
            </h4>
            <ul className="space-y-0.5">
              {group.links.map((link) => (
                <li key={link.to + link.label}>
                  <NavLink
                    to={link.to}
                    end
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `relative block rounded-lg px-3 py-1.5 transition before:absolute before:inset-y-1.5 before:left-0 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-brand-500 before:to-brand-700 before:transition-opacity ${
                        isActive
                          ? 'bg-gradient-to-r from-brand-50 to-transparent font-semibold text-brand-700 before:opacity-100 dark:from-brand-500/15 dark:text-brand-300'
                          : 'text-slate-600 before:opacity-0 hover:translate-x-0.5 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ),
      )}
    </nav>
  )
}

// The User / Admin switcher — the heart of the two-panel split.
function PanelSwitch() {
  const { pathname } = useLocation()
  const active = panelFor(pathname).key
  const item = (key, Icon, label) => (
    <Link
      to={PANELS[key].home}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition ${
        active === key
          ? key === 'admin'
            ? 'bg-rose-600 text-white shadow-sm'
            : 'bg-brand-600 text-white shadow-sm'
          : 'text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
      }`}
    >
      <Icon size={14} />
      {label}
    </Link>
  )
  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800/60">
      {item('user', User, 'User')}
      {item('admin', UserCog, 'Admin')}
    </div>
  )
}

export default function Layout({ children }) {
  const [dark, setDark] = useDarkMode()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const isLanding = pathname === '/'
  const panel = panelFor(pathname)

  useEffect(() => {
    window.scrollTo(0, 0)
    setMobileOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 shadow-sm shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:shadow-black/20">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4">
          {!isLanding && (
            <button className="lg:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30 ring-1 ring-white/20 transition group-hover:scale-105">
              <Boxes size={18} />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Gamru
              <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent dark:from-brand-300 dark:to-brand-500">
                {' '}
                Docs
              </span>
            </span>
          </Link>

          {/* the panel switcher */}
          <div className="ml-3 hidden sm:block">
            <PanelSwitch />
          </div>

          {!isLanding && (
            <nav className="ml-4 hidden items-center gap-1 lg:flex">
              {panel.top.map((t) => (
                <NavLink
                  key={t.to + t.label}
                  to={t.to}
                  end={t.to === panel.home}
                  className={({ isActive }) =>
                    `relative rounded-md px-3 py-1.5 text-sm font-medium transition after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-brand-500 after:to-brand-700 after:transition-opacity ${
                      isActive
                        ? 'text-brand-700 after:opacity-100 dark:text-brand-300'
                        : 'text-slate-600 after:opacity-0 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`
                  }
                >
                  {t.label}
                </NavLink>
              ))}
            </nav>
          )}

          <div className="ml-auto flex items-center gap-3">
            {!isLanding && (
              <div className="hidden sm:block">
                <SearchBox panelKey={panel.key} />
              </div>
            )}
            <LanguageSelect />
            <button
              onClick={() => setDark((v) => !v)}
              className="rounded-xl border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-brand-300"
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
        {/* mobile panel switch */}
        <div className="border-t border-slate-200/70 px-4 py-2 dark:border-white/10 sm:hidden">
          <PanelSwitch />
        </div>
      </header>

      {isLanding ? (
        <main className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-12">{children}</main>
      ) : (
        <div className="mx-auto flex max-w-[1400px]">
          {/* sidebar (desktop) */}
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 overflow-y-auto border-r border-slate-200/70 bg-gradient-to-b from-slate-50/50 to-transparent px-3 py-6 dark:border-white/10 dark:from-slate-900/40 lg:block">
            <Sidebar panel={panel} />
          </aside>

          {/* sidebar (mobile drawer) */}
          {mobileOpen && (
            <div className="fixed inset-0 z-30 lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
              <aside className="absolute left-0 top-16 h-[calc(100vh-4rem)] w-72 overflow-y-auto border-r border-slate-200 bg-white px-3 py-6 dark:border-slate-800 dark:bg-slate-950">
                <Sidebar panel={panel} onNavigate={() => setMobileOpen(false)} />
              </aside>
            </div>
          )}

          {/* content */}
          <main className="min-w-0 flex-1 px-5 py-10 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-4xl">{children}</div>
            <footer className="mx-auto mt-20 max-w-4xl border-t border-slate-200 pt-6 text-sm text-slate-400 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>Gamru Docs · {panel.key === 'admin' ? 'admin — manage Gamru' : 'user — use Gamru'}</span>
                <span className="inline-flex items-center gap-1.5">
                  <Github size={14} /> internal developer portal
                </span>
              </div>
            </footer>
          </main>
        </div>
      )}
    </div>
  )
}
