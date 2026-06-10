import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Boxes, Github, Menu, Moon, Search, Sun, X } from 'lucide-react'
import { NAV, TOP_NAV } from '../data/nav'
import { ENDPOINTS } from '../data/endpoints'
import { FLOWS } from '../data/flows'
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

// Lightweight client-side search across flows + endpoints.
const SEARCH_INDEX = [
  ...FLOWS.map((f) => ({ label: f.title, sub: 'Flow · ' + f.tag, to: `/flows/${f.id}` })),
  ...ENDPOINTS.map((e) => ({
    label: `${e.method} ${e.path}`,
    sub: `${e.platform === 'gamru' ? 'Gamru' : 'Games'} · ${e.title}`,
    to: `/api/${e.platform}#${e.id}`,
  })),
]

function SearchBox() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const results = q.trim()
    ? SEARCH_INDEX.filter((x) => (x.label + ' ' + x.sub).toLowerCase().includes(q.toLowerCase())).slice(0, 8)
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
          placeholder="Search docs & endpoints…"
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

function Sidebar({ onNavigate }) {
  return (
    <nav className="space-y-7 pb-16 text-sm">
      {NAV.map((group) => (
        <div key={group.section}>
          <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {group.section}
          </h4>
          <ul className="space-y-0.5">
            {group.links.map((link) => (
              <li key={link.to + link.label}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-1.5 transition ${
                      isActive
                        ? 'bg-brand-50 font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

export default function Layout({ children }) {
  const [dark, setDark] = useDarkMode()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
    setMobileOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4">
          <button className="lg:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Boxes size={18} />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Gamru<span className="text-brand-600 dark:text-brand-400"> Docs</span>
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {TOP_NAV.map((t) => (
              <NavLink
                key={t.to + t.label}
                to={t.to}
                end={t.to === '/'}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? 'text-brand-700 dark:text-brand-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:block">
              <SearchBox />
            </div>
            <LanguageSelect />
            <button
              onClick={() => setDark((v) => !v)}
              className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px]">
        {/* sidebar (desktop) */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 overflow-y-auto border-r border-slate-200 px-3 py-6 dark:border-slate-800 lg:block">
          <Sidebar />
        </aside>

        {/* sidebar (mobile drawer) */}
        {mobileOpen && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-16 h-[calc(100vh-4rem)] w-72 overflow-y-auto border-r border-slate-200 bg-white px-3 py-6 dark:border-slate-800 dark:bg-slate-950">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        {/* content */}
        <main className="min-w-0 flex-1 px-5 py-10 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl">{children}</div>
          <footer className="mx-auto mt-20 max-w-4xl border-t border-slate-200 pt-6 text-sm text-slate-400 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span>Gamru Docs · gamification engine + games-platform integration</span>
              <span className="inline-flex items-center gap-1.5">
                <Github size={14} /> internal developer portal
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
